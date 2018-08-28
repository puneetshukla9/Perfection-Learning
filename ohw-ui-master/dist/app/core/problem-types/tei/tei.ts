'use strict';

import * as $ from 'jquery';
import * as createjs from 'createjs-module';

export default function(MultiPart, DragAndDrop, Matching, MultiSelect) {
	var EOC;

	var config = {
		inject: {
			$: $,
			MathJax: MathJax,
			createjs: createjs
		},
		imgSrc: '//qa1.perfectionlearning.com/media/'
	};

	var classes = {
		'drag-and-drop': {
			dropArea: 'drops',
			draggableContainer: 'dragsC',
			draggable: 'drags',
			dropped: 'dropped'
		}
	};

	// Go through a string character by character, and replace commas between quotes
	function getListOfSubmissions(str) {
	  var newStr = '';
		var internalQuote1 = false;
	  var internalQuote2 = false;
		var internalQuote3 = false;
	  // First, go through the string, and find internal quotes.
		// Replace commas with a special character sequence.
		for (let i = 0; i < str.length; i++) {
	    if (str.substr(i, 2) === '\\\"') {
	      if (internalQuote1) {
	        newStr += '<IQ_END>';
	        internalQuote1 = false;
	      } else {
	        newStr += '<IQ_BEGIN>';
	        internalQuote1 = true;
	      }
	      i++;
			} else if (str.substr(i, 9) === '\\\\\\\&quot;') {
	      if (internalQuote3) {
	        newStr += '__42__';
	        internalQuote3 = false;
	      } else {
	        newStr += '__42__';
	        internalQuote3 = true;
	      }
	      i += 8;
			} else if (str.substr(i, 4) === '\\\\\\\"') {
	      if (internalQuote3) {
	        newStr += '__42__';
	        internalQuote3 = false;
	      } else {
	        newStr += '__42__';
	        internalQuote3 = true;
	      }
	      i += 3;
	    } else if (str.substr(i, 7) === '\\\&quot;') {
	      if (internalQuote2) {
	        newStr += '<IQ_END>';
	        internalQuote2 = false;
	      } else {
	        newStr += '<IQ_BEGIN>';
	        internalQuote2 = true;
	      }
	      i += 6;
	    } else if ((internalQuote1 || internalQuote2 || internalQuote3) && str.substr(i, 1) === ',') {
	      newStr += '__C__';
	    } else {
	      newStr += str[i];
	    }
	  }

		// Split the resulting string. Internal commas will be preserved.
		var submissionList = newStr.length > 0 ? newStr.split(',') : [];

		// For each submission element, replace the commas and quotes.
		var quoteReplacement = '';
		submissionList.forEach((item, ndx) => {
		  item = item.replace(/__C__/g, ',');
		  item = item.replace(/(<IQ_BEGIN>)|(<IQ_END>)/g, quoteReplacement);
			item = item.replace(/__42__/g, '\\\\\\\&quot;');
		  submissionList[ndx] = item;
		});

		// Return the resulting array of submissions.
	  return submissionList;
	}

	function normalizeMultiSubmission(sub) {
		var _sub = JSON.parse(JSON.stringify(sub));
/*
	THIS IS SOMETHING WE WILL PROBABLY REMOVE. JUST KEEPING IT IN CASE WE NEED TO GET IT BACK.
	IT WAS ADDED TO KEEP "\"0,7,14,9,4,11\"" FROM GETTING BROKEN INTO AN ARRAY OF SIX NUMBERS
	INSTEAD OF A STRING OF SIX NUMBERS WITH COMMAS BETWEEN THEM.
		// First step in process to preserve commas between \\"
		let _safety = 0;
		_sub = _sub.replace(/\\"(\d+),/g, '$1_');
		while (/_\d+,/.test(_sub) && _safety < 100) {
			_sub = _sub.replace(/(_\d+),/g, '$1_');
			_safety++;
		}
*/

		var _normalized = getListOfSubmissions(_sub);
/*
		var types = [
			{ begin: /^\\&quot;/, end: /\\&quot;$/, sep: /\\&quot;,\\&quot;/g },
			{ begin: /^\\"/, end: /\\"$/, sep: /\\",\\"/g }
		];

		// This delimiter is just an arbitrary string that's most unlikely to appear in any other context.
		// It's not used except within this function. It does not correspond to anything assumed to be used
		// as a delimiter anywhere else.
		var delim = '^^^^^';
		types.forEach((type) => {
			_sub = _sub.replace(type.sep, delim).replace(type.begin, '').replace(type.end, '');
		});
		// Attempt to deal with unquoted parts.
		// This shouldn't be necessary. Check to see if backend can store each separate part in quotes.
		// What we have here is a plague of backslashes.
		_sub = _sub.replace(/\\\\\\\&quot;/g, '__42__');
		_sub = _sub.replace(/\\\&quot;,/, delim); // This will work only when a quoted bit precedes an unquoted bit, not the other way around.
		_sub = _sub.replace(/__42__/g, '\\\\\\\&quot;');
		// At this point, we should have a string in which submissions for parts are delimited with a common sequence of characters.

		var _normalized = _sub.split(delim);
		*/
/*
	So this business of splitting a single-element _normalized result breaks some submissions; e.g.,
	["0,7,14,9,4,11"]. Since we don't remember what it was put in here to fix, we'll comment it out
	but leave the code, in case we need to get it back.
		// If this leaves us with a single-element array, we need to split using a comma delimiter.
		if (_normalized.length === 1) {
			_normalized = _normalized[0].split(',');
		}
*/
/*
	SEE ALL-CAPS NOTE ABOVE.
		// Last step in process to preserve commas between \\"
		_normalized.forEach((item, ndx) => {
			_normalized[ndx] = item.replace(/_/g, ',');
		});
*/
		// At this stage, there's probably nothing left for parseMultiSubmission to do.

		return _normalized;
	}

	function fixMathML(sub) {
		var res = [
			/\\+"/g,
			/\\+&quot;/g
		];
		var re = /\\+"/g;
		sub.forEach((item, ndx) => {
			if (typeof item === 'string') {
				sub[ndx] = sub[ndx].replace(/&lt;/g, '<');
				sub[ndx] = sub[ndx].replace(/&gt;/g, '>');
				sub[ndx] = sub[ndx].replace(/&amp;/g, '&');
				if (sub[ndx].indexOf('<math') !== -1) {
					res.forEach((re) => {
						sub[ndx] = sub[ndx].replace(re, '"');
					});
				}
			}
		});
		return sub;
	}

	function parseMultiSubmission(sub) {
		var _normalized = normalizeMultiSubmission(sub);
		return _normalized;
	}

	function getExtendedParts(prob, part_answers) {
		try {
			var eoc = new ExtendedTypes.default(prob, config);
			EOC = eoc;
			var parts = EOC.getParts();
		} catch (e) {
			parts = [];
			console.log('getExtendedParts error', e, prob.a, prob.orig_a);
		}
		return parts;
	}


	function formatA(prob) {
		if (prob.presentation_data.type === 'drag_drop_1') {
			config.classes = classes['drag-and-drop'];
			EOC = new ExtendedTypes.default(prob, config);
			var els = EOC.getBlocks();

			let a = DragAndDrop.formatA(els);
			return a;

		} else if (prob.presentation_data.type === 'matching') {
			EOC = new ExtendedTypes.default(prob, config);
			var els = EOC.getBlocks();
			let a = Matching.formatA(els);
			return a;

		} else if (prob.presentation_data.type === 'multiselect') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var els = EOC.getBlocks();
			var a = MultiSelect.formatA(els);
			return a;

		} else if (prob.presentation_data.type === 'multi_part_answer') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var parts = EOC.getParts();
			let a = MultiPart.formatA(prob, parts);
			return a;

		} else {
			return prob.a;
		}
	}

	function formatQ(prob) {
		if (prob.presentation_data.type === 'drag_drop_1') {
			config.classes = classes['drag-and-drop'];
			EOC = new ExtendedTypes.default(prob, config);
			var els = EOC.getBlocks();
			let q = DragAndDrop.formatQ(prob, els);
			return q;

		} else if (prob.presentation_data.type === 'matching') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var els = EOC.getBlocks(0);
			var q = Matching.formatQ(prob, els);
			return q;

		} else if (prob.presentation_data.type === 'multiselect') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var els = EOC.getBlocks();
			var q = MultiSelect.formatQ(prob, els);
			return q;

		} else if (prob.presentation_data.type === 'multi_part_answer') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var parts = EOC.getParts();
			let q = MultiPart.formatQ(prob, parts);
			return q;

		} else {
			return prob.q;
		}
	}

	function formatSub(prob) {
		if (prob.presentation_data.type === 'drag_drop_1') {
			config.classes = classes['drag-and-drop'];
			EOC = new ExtendedTypes.default(prob, config);
			var els = EOC.getBlocks();
			let q = DragAndDrop.formatSub(els);
			return q;

		} else if (prob.presentation_data.type === 'matching') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var els = EOC.getBlocks();
			let q = Matching.formatSub(els);
			return q;

		} else if (prob.presentation_data.type === 'multiselect') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var els = EOC.getBlocks();
			var q = MultiSelect.formatSub(els);
			return q;

		} else if (prob.presentation_data.type === 'multi_part_answer') {
			if (!EOC || !(EOC.probID === prob.probID && EOC.studentID === prob.uid)) {
				EOC = new ExtendedTypes.default(prob, config);
			}
			var parts = EOC.getParts();
			var q = MultiPart.formatSub(prob, parts);
			return q;

		} else {

		}
	}

	// Massage extended problem of type multi_part_answer
	function massageMultiPart(prob) {

		try {
			var part_answers = JSON.parse('[' + prob.a + ']');
		} catch (e) {
			part_answers = JSON.parse('[]');
			console.log('JSON parsing error in problem answer. Check for incorrect escaping of quotes. Problem ID', prob.probID);
		}

		try {
			prob.orig_a = fixMathML(part_answers);
		} catch (e) {
			prob.orig_a = prob.a;
			console.log('Massage MultiPart, Error attempting fixMathML for part_answers', e, prob.probID, prob.a);
		}
		var orig_submissions = parseMultiSubmission(prob.submission);
		try {
			orig_submissions = fixMathML(orig_submissions);
		} catch (e) {
			console.log('Massage MultiPart (2), Error attempting fixMathML', e, orig_submissions);
		}
		prob.orig_submission = orig_submissions;

		//prob.extendedParts = getExtendedParts(prob, part_answers);

		return prob;
	}


  return {
		parseMultiSubmission: parseMultiSubmission,
		getExtendedParts: getExtendedParts,
		fixMathML: fixMathML,
		massageMultiPart: massageMultiPart,
//    format: format,
		formatA: formatA,
		formatQ: formatQ,
		formatSub: formatSub
  };
}
