'use strict'

//===========================================================================================
// Stress Test for performance optimization
//===========================================================================================
var _ = require('lodash');
var async = require('async');
var restify = require('restify');

//=======================================================
// Configuration
//=======================================================
//var url = 'http://localhost:8080';
var url = 'http://alghwstaging.kineticmath.com';
var serverPath = '/endpoint.php';

var cookie = 'kid=i3uba37us8lbomfj3j6p8gf9b6; kid_staging=5ocm02qjhcht09g33qshh925s7';
var assignID = '67540';

var headers = {Cookie: cookie};

var testCount = 1;
var OpsPerTest = 5;

//=======================================================
// Globals
//=======================================================
var client;

var record = {};
var testList = [];

var addIdx = 1;
var transList = {};

//=======================================================
// Execute tests
//=======================================================
console.log('Starting');

async.series([
	createClient,
	executeTests
], done);


//=======================================================
//
//=======================================================
function createClient(callback)
{
	client = restify.createJsonClient({
		url: url,
		headers: headers
	});

	callback(null);
}

//=======================================================
// Completed -- Show results
//=======================================================
function done(err)
{
	if (err)
		console.log(err);

	// The REST client takes a while to shut down, possibly due to "keep alive".
	// Closing the client causes it to exit immediately.
	client.close();
}

//===========================================================================================
// TESTS
//===========================================================================================

//=======================================================
// Perform each test
//=======================================================
function executeTests(callback)
{
	var idx = 0;

	async.until(
		function() { return idx >= testCount },		// Conditional

		// Perform one test
		function(cb) {
			idx++;
			async.waterfall([
				createOne,
				save,
				load,
				verify
			], cb);
		},

		// All tests done
		callback
	);
}

//=======================================================
//
//=======================================================
function createOne(callback)
{
	testList = [];
	record = {
		id: assignID,
		name: 'Stress test',
		mode: 'homework',
		tries: 3,
		scoring: 'full',
		notes: 'note',
		share: false,
		probs: []
	};

	for (var i = 0; i < OpsPerTest; i++)
	{
		addOp(record);

		// Perform an optional second change
		if (Math.random() < 0.5)
			addOp(record);

		// Save the result
		testList.push(_.cloneDeep(record));
	}

	callback(null);
}

//=======================================================
// Modify the running record
//=======================================================
function addOp(entry)
{
	var choices = [
		{weight: 1, op: adjName},
		{weight: 1, op: adjMode},
		{weight: 1, op: adjTries},
		{weight: 1, op: adjScoring},
		{weight: 1, op: adjNotes},
		{weight: 1, op: adjShare},

		{weight: 6, op: addProbs},
		{weight: 6, op: delProbs},
		{weight: 4, op: orderProbs}
	];

	// Figure out the total weight
	var totalWeight = 0;
	for (var i = 0; i < choices.length; i++)
		totalWeight += choices[i].weight;

	// Pick a random entry
	var rnd = Math.random() * totalWeight;
	for (var i = 0; i < choices.length; i++)
	{
		if (rnd < choices[i].weight)
			break;

		rnd -= choices[i].weight;
	}

	// Perform the appropriate operation
	choices[i].op(entry);

	return entry;
}

//=======================================================
//=======================================================
function adjName(record)
{
	var prefix = ['Test ', 'Prefix ', 'Assign ', 'Thing '];
	record.name = _.sample(prefix) + _.random(1, 100);
}

//=======================================================
//=======================================================
function adjMode(record)
{
	var opts = ['homework', 'test', 'quiz', 'ipractice'];
	record.mode = _.sample(opts);
}

//=======================================================
//=======================================================
function adjTries(record)
{
	record.tries = _.random(1,10);
}

//=======================================================
//=======================================================
function adjScoring(record)
{
	var opts = ['full', 'deduct'];
	record.scoring = _.sample(opts);
}

//=======================================================
//=======================================================
function adjNotes(record)
{
	var prefix = ['Note ', 'Warning ', 'Memo ', 'Message '];
	record.notes = _.sample(prefix) + _.random(1, 100);
}

//=======================================================
//=======================================================
function adjShare(record)
{
	var opts = [true, false];
	record.share = _.sample(opts);
}

//=======================================================
//=======================================================
function addProbs(record)
{
	var addCnt = _.random(1, 9);
	var pidList = [72955,72956,72957,72958,72959,72960,72961,72962,72963,72964,72965,72966,72967,72968,72969,72970,72971,72972,72973,72974,72975,72976,72977,72990,72991,72992,72993,72994,72995,72996,72997,72998,73056,73057,73058,73059,73060,73061,73062,73063,73064,73065,73066,73067,73068,73069,73070,73071,73072,73085,73086,73087,73088,73089,73090,73091,73092,73093,73094,73095,73096,73097,73098,73099,73100,73105,73106,73107,73108,73109,73110,73111,73112,73113,73114,73115,73116,73117,73118,73119,73120,73121,73122,73123,73124,73125,73126,73127,73128,73129,73130,73131,73132,73133,73134,73135,73136,73137,73138,73139];

	// Add a random pid to a random spot
	for (var i = 0; i < addCnt; i++)
	{
		var pid = _.sample(pidList);
		var idx = _.random(0, record.probs.length - 1);
		var pts = _.random(1, 99);

		record.probs.splice(idx, 0, {
			id: '_' + (addIdx++),
			pid: pid,
			pts: pts
		});
	}
}

//=======================================================
//
//=======================================================
function delProbs(record)
{
	var max = Math.min(record.probs.length, 9);
	var delCnt = _.random(1, max);

	for (var i = 0; i < delCnt; i++)
	{
		// Pick an index
		var idx = _.random(0, record.probs.length - 1);
		record.probs.splice(idx, 1);
	}
}

//=======================================================
//
//=======================================================
function orderProbs(record)
{
	record.probs = _.shuffle(record.probs);
}

//=======================================================
//
//=======================================================
function save(callback)
{
	async.eachSeries(testList, doSave,
		function(err) {callback(err);}
	);
}

//=======================================================
//=======================================================
function doSave(entry, callback)
{
	for (var i = 0; i < entry.probs.length; i++)
	{
		if (transList[entry.probs[i].id])
			entry.probs[i].id = transList[entry.probs[i].id];
	}

	console.log(entry.probs);

	// Perform translation
	client.put(serverPath + '/save',
		[{
			id: entry.id,
			name: entry.name,
			mode: entry.mode,
			tries: entry.tries,
			scoring: entry.scoring,
			notes: entry.notes,
			share: entry.share,
			probs: entry.probs
		}],

		function(err, req, res, obj) {

			// Add to the translation list
			_.each(obj.remap, function(val, key) {
				transList[key] = val;
			});

			callback(err);
		}
	);
}

//=======================================================
//
//=======================================================
function load(callback)
{
	callback(null);
}

//=======================================================
//
//=======================================================
function verify(callback)
{
	callback(null);
}