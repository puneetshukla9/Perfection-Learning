'use strict';
/* tslint:disable */


// A wrapper for the VTP library.
//
// This isn't entirely useful right now. All it does is enforce a single fixed seed and
// vaguely simplify the API.

var vtp = require('./../../../vendor/vtp-full/undefined.js');

export default function() {


	// var vtp = require('script!./vtp');

	// Use a fixed seed for basic VTP. Problems will generally be deterministic.
	var mySeed = 1234567890;

	// A list of problem fields to VTP.
	// Data in the field can be a single value or an array, which will be handled automatically.
	// List entries can also be an array (Object mode).
	// In that case, the first value is the field name, and the second value is the child field to use for VTP.
	// In object mode, destination data can either be a single object, or an array of objects.
	// The child field within the destination object (or array of objects) can be an array or single value, just like top-level fields.
	var fieldList = ['prefix', 'q', 'a', ['choices', 'a'], ['overlays', 'text'], ['graph', 'eqs'], 'parts'];

/*

	// Returns an array of instances of a single field from
	// an array of objects.

	function pluck(ary, field)
	{
		var out = [];

		for (var i = 0, len = ary.length; i < len; i++)
			out.push(ary[i][field]);

		return out;
	}
*/


	// Perform VTP on a list of strings -- single point
	// VTP library access

	function evaluate(strings, vars, constraints, avoidSeeds, ruleType)
	{
		var rules = {};
		rules[ruleType] = true;
		return vtp.evaluate(strings, vars || [], constraints, avoidSeeds, mySeed, rules, 'vtp');
	}


	// Extract VTP strings for a single field
	//
	// Helper function for fieldsToStrings.
	// Intimately familiar with its internals.

	function oneField(field, name, out)
	{
		if (field instanceof Array && field.length > 0)		// Check for array processing
		{
			// Ideally, we'd check to see if any string in the array needs VTP, but that's too slow to bother with.
			out.exists[name] = true;
			for (var i = 0, len = field.length; i < len; i++)
				out.strings.push(field[i]);
		}
		else if (typeof field ==='string' && field.indexOf('[') !== -1)	// String -- Don't VTP unless we need to (this can have false positives, but is mostly good enough)
		{
			out.exists[name] = true;
			out.strings.push(field);
		}
		else
			out.skipped[name] = field;
	}


	// Extract fields into an array of strings

	function fieldsToStrings(data)
	{
		var out = {strings:[], exists: {}, skipped: {}};

		angular.forEach(fieldList, function(entry) {
			if (typeof entry === 'string')
				oneField(data[entry], entry, out);
			else if (data[entry[0]])		// Object mode -- ensure the field exists first
			{
				var target = data[entry[0]];

				if (!(target instanceof Array))
					oneField(target[entry[1]], entry[0], out);	// Single object
				else
				{
					// Array of objects -- pull out the field we care about
					var allItems = _.map(target, entry[1]);
					oneField(allItems, entry[0], out);
				}
			}
		});

		return out;
	}


	// Unpack VTP strings back into a single field
	//
	// Helper function for stringsToFields.
	// Intimately familiar with its internals.

	function restoreOne(field, destObj, strings, source)
	{
		if (source instanceof Array && source.length > 0)		// Check for array processing
		{
			destObj[field] = [];		// Create the destination array

			for (var i = 0, len = source.length; i < len; i++)
				destObj[field].push(strings.shift());
		}
		else		// Assume string. Only arrays and strings were added.
			destObj[field] = strings.shift();		// Only for strings
	}


	// Clones an object to the destination, then updates
	// a single field with a VTPed value

	function restoreObj(parentName, childName, source, dest, strings)
	{
		// Objects: Copy the entire original object and replace a single field

		// Clone the object
		dest[parentName] = angular.copy(source);

		// Update the field
		restoreOne(childName, dest[parentName], strings, source[childName]);
	}


	// Does the opposite of fieldsToStrings()
	// Unpacks an array of strings (presumably VTPed) back into an object
	//
	// Params:
	//   data: Original problem (needed for types, array length, and cloning)
	//   strings: VTPed strings that need to be placed in the correct field
	//   exists: hash that specifies whether a given field was present in the source

	function stringsToFields(data, strings, exists)
	{
		var out = {};

		// Iterate over the fieldList again, NOT the string list. We need to know what the proper destination is for each.
		angular.forEach(fieldList, function(entry) {
			if (typeof entry === 'string' && exists[entry])
				restoreOne(entry, out, strings, data[entry]);
			else if (typeof entry !== 'string' && exists[entry[0]])
			{
				var src = data[entry[0]];

				// Are we dealing with a single object, or an array of objects?
				if (src instanceof Array)
				{
					out[entry[0]] = [];		// Create an empty array to hold the processed array of objects

					// Array of objects. Restore each one.
					for (var idx = 0, len = src.length; idx < len; idx++)
						restoreObj(idx, entry[1], src[idx], out[entry[0]], strings);
				}
				else
					restoreObj(entry[0], entry[1], src, out, strings);		// Single object
			}
		});

		return out;
	}


	//

	function addSkipped(dest, list)
	{
		angular.forEach(list, function(val, key) {
			dest[key] = val;
		});
	}


	// Copy fields to the VTP structure without modification

	function noVTP(prob)
	{
		prob.vtp = {};
		angular.forEach(fieldList, function(entry) {
			if (typeof entry === 'string')
				prob.vtp[entry] = prob[entry];
			else
				prob.vtp[entry[0]] = prob[entry[0]];
		});
	}


	// Basic VTP functionality. Used on the top level and on steps.

	function vtpCore(prob, avoidList, isVTP)
	{
		if (!isVTP)
			return noVTP(prob);

		// Extract fields into an array of strings
		var extract = fieldsToStrings(prob);

		// Perform evaluation
		var vtp = evaluate(extract.strings, prob.vars, prob.constraints, avoidList, prob.ruleType);

		// Unpack array of VTPed strings back into an object
		prob.vtp = stringsToFields(prob, vtp.strings, extract.exists);

		// Merge in skipped values
		addSkipped(prob.vtp, extract.skipped);

		// Store the seed, for posterity
		prob.vtp.seed = vtp.seed;
	}


	// VTP a single problem
	//
	// Optionally, accepts a list of seeds to use to guarantee
	// uniqueness.

	function vtpOneProblem(prob, avoidList)
	{
		// Only do this once
		if (!prob.vtp)
		{
			// VTP the top level
			vtpCore(prob, avoidList, prob.isVTP);

			// VTP the steps, if any
			// Yes, we will get a different seed for the top level and each step.
			// Depending on constraints, that's more or less efficient. The code is
			// simpler this way.
			if (prob.parts) {
				angular.forEach(prob.parts, function(step) {
					vtpCore(step, avoidList, prob.isVTP);
				});
			}
		}
	}


	// Adds VTP data to a block of problems
	//
	// This routine assumes that variable info is passed in with each problem

	function vtpProblems(data)
	{
		for (var i = 0, len = data.length; i < len; i++)
			vtpOneProblem(data[i]);
	}


	// Public API

	return {
		eval: vtpOneProblem,			// VTP a single problem
		vtpProblems: vtpProblems		// Adds VTP data to a block of problems
	};


};
