'use strict';


// Graded Problems
//
// @FIXME/dg: This is an example of a poor model. It's too long, with too much functionality.
// Pieces:
//	Load data
//	 Error handling
//	Grade change
//	 Error handling
//	Transform / clean input data (centralize on back-end?)
//	Maintain mode (obsolete!)
//	Collection lookups
//	Pending counts / searches

export default function($rootScope, Grade, TEI, AppState, PubSub) {

	// Internal model
	// Translate server answer types to something more sane
	var ansMap = {
		Kinetic: 'equation',
		input: 'equation',
		Multiple: 'check',
		MultKinetic: 'freeInput',
		VTPGraph: 'graphPlot',
		graphConst: 'graphConst',	// No change
		'no input': 'paper',
		essay: 'essay',
		check: 'check',
		radio: 'radio',
		multiPart: 'multiPart',
		'drag_drop_1': 'dragDrop',
		'drag_drop_2': 'dragDrop',
		'matching': 'matching',
		'multi_part_answer': 'multi_part_answer',
		'table_items': 'table_items'
	};

	// Functions to normalize submitted and stored answers
	var format = {
		equation: formatGenericA,
		freeInput: formatFreeA,
		check: formatMultChoice,
		radio: formatMultChoice,
		graphPlot: formatGraphA,
		graphConst: formatGraphConstA,
		essay: formatGenericA,
		paper: formatGenericA,
		multiPart: formatMultiPartA,
		dragDrop: formatGenericA,
		matching: formatGenericA,
		multi_part_answer: formatGenericA,
		table_items: formatGenericA
	};

	// qNum
	// pset_id, psp_id, user_id, first_name, last_name
	// prefix, question, qImg, qImgText, choices
	// graphequations, graphparms
	// answer, ansType,
	// points, maxPoints, tries, maxTries, ++isPending
	// given
	var probList = [];
	var due;

	var scoreObj = {
		score: 0,
		scoreMax: 0
	};

	//=======================================================
	// Convert from 'e' format to 'x10' format for scientific notation
	//=======================================================
	function modifySciNote(str) {
			var regex = /(\d)e((-|&#8722;)*)(\d+)/g;
			return str.replace(regex, '$1\xD710<sup>$3$4</sup>');
	}

	function set(data) {

		// Do some formatting and conversion.
		_.each(data, function(src, idx) {
			var problem = src.problem;
			due = new Date(src.assignment.due);
			var newProb = {
				id: idx,
				qNum: problem.idx,
				aid: src.assignment.id,
				qid: problem.id,
				probID: problem.pid,

				uid: src.student.id,
				uname: {first: src.student.first, last: src.student.last},
				assign: src.assignment.name,
				dueDate: src.assignment.due,
				assignedDate: src.assignment.assigned,
				type: src.assignment.type,
				capitalType: convertType(src.assignment.type),
				ipractice: src.assignment.type === 'ipractice',

				prefix: problem.prefix,
				q: modifySciNote(problem.q),
				choices: problem.choices,
				qImg: problem.qImg,
				qImgOverlay: problem.qImageText,

				graph: convertGraph(problem.graph),

				a: problem.a,
				orig_a: problem.a,
				ansType: setAnsType(problem),
				presentation_data: problem.presentation_data,
				isExtended: isExtended(problem.presentation_data),
				isWide: isWide(problem),

				rubric: getRubric(problem.instance_presentation_data, problem.presentation_data),
				hasRubric: hasRubric(problem.presentation_data),

				score: setScore(problem, due), //(problem.status !== 'pending' ? parseFloat(problem.points) : ''),
				scoreMax: parseFloat(problem.maxPoints),
				attempts: problem.tries,
				attemptsMax: problem.maxTries,
				attemptsLeft: problem.maxTries - problem.tries,
				status: problem.status,
				isPending: problem.status === 'pending',	// Shortcut
				isInProgress: setProgressFlag(problem.status, due), // && between assigned and due dates
				isPastDue: isPastDue(due),

				standards: src.standards,

				submission: cleanOrigSubmission(problem.submission) || '',
				orig_submission: cleanOrigSubmission(problem.submission) || '',
				parts: problem.parts && problem.parts.map(function(part) {
					return formatPart(idx, part);
				})
			};

			if (isExtendedMultiPart(newProb.presentation_data)) {
				try {
					newProb = TEI.massageMultiPart(newProb);
				} catch (e) {
					console.log('Error massaging multipart problem', newProb.probID, e);
				}
			}

			adjustAttempts(newProb);
			cleanEquations(newProb);
			cleanAnswer(newProb);
			cleanSubmission(newProb);
			if (format[newProb.ansType]) {
				format[newProb.ansType](newProb);
/*
				if (newProb.ansType === 'essay' && Object.keys(newProb.presentation_data).length > 0) {
					ExtendedProblemTypes.format(newProb);
				} else {
					format[newProb.ansType](newProb);
				}
*/
			}
			keepScore(newProb);

			probList.push(newProb);
		});

		return probList;
	}

	function formatPart(idx, part) {
		var newPart = {
			id: idx,
			tags: part.tag,
			hint: part.hint,
			choices: part.choices,
			submission: part.submission,
			pts: part.points,
			scoreMax: part.maxPoints,
			status: part.status,
			a: part.a,
			q: part.q,
			attemptsMax: part.maxTries,
			attempts: part.tries,
			ansType: part.ansType,
			prefix: part.prefix,
			graph: convertGraph(part.graph)
		};

		return newPart;
	}

// Formatters

	function convertType(type) {
		var types = {
			'homework': 'Homework',
			'test': 'Test',
			'quiz': 'Quiz',
			'ipractice': 'i-Practice'
		};
		return types[type];
	}

	function formatGraphA(prob) {
		prob.cleanA = prob.a;
		// Coordinates are coming in now as ["x,y","x,y","x,y"] instead of "x,y,x,y,x,y"
		// This converts from the former to the latter, since that's what the graphing code
		// expects.
		prob.cleanSub = prob.submission.replace(/&#8722;/g, '-');  // Fix negative numbers.
		prob.cleanSub = prob.cleanSub.replace(/","/g, ',');        // Remove internal quotes.
		prob.cleanSub = prob.cleanSub.replace(/[\]\["]/g, '');     // Remove array brackets and external quotes.
	}

	function formatGenericA(prob) {
		prob.cleanA = prob.a;
		prob.cleanSub = prob.submission;
	}

	function formatFreeA(prob) {
		prob.cleanA = stripFIAnswer(prob.a);
		prob.cleanSub = prob.submission;
	}

	function formatMultChoice(prob) {
		prob.cleanA = _.map(prob.choices, function(entry){ return {text: entry}; });
		prob.cleanSub = _.cloneDeep(prob.cleanA);
		var correct = prob.a.split(',');
		var submits = prob.submission && prob.submission.split(',') || [];

		for (var i = 0, len = prob.choices.length; i < len; i++) {
			var idxStr = i + '';
			if (correct.indexOf(idxStr) !== -1) {
				prob.cleanA[i].check = true;
//				prob.cleanA[i].style = 'mcCorrectAns';
			}

			if (submits.indexOf(idxStr) !== -1) {
				prob.cleanSub[i].check = true;
				prob.cleanSub[i].style = prob.cleanA[i].check ? 'mcCorrectSub' : 'mcWrongSub';
			}
		}
	}

	function formatMultiPartA(prob) {
		prob.parts.forEach(function(part, idx) {
			part.ansType = ansMap[part.ansType];
			if (format[part.ansType]) {
				format[part.ansType](part);
			}
		});
	}

	function formatGraphConstA(prob) {
		prob.cleanA = prob.graph.eqs[0];

		var type = prob.cleanA.split('=')[0];

		prob.cleanSub = type + '=' + prob.submission;
	}

	function stripFIAnswer(mml) {
		var ansList = [];
		var regex = /<maction[^>]*>(<mtext>|<mn[^>]*>)*(.+?)(<\/mtext>|<\/mn>)*<\/maction>/g;

		// replace seems like the wrong choice. We just want to search. But multiple sets of parens means we'd have to prune out most of the results.
		mml.replace(regex, function(full, opener, val, closer) {
			ansList.push(val);	// Save the part we care about.
			return full;			// Return without changes. Clumsy!
		});
		return ansList.join(',');
	}

	function adjustAttempts(prob) {
		if (prob.ipractice) return; // No adjustments for iPractice

		//var singleAttempt = ['paper', 'essay', 'check', 'radio'];
		// Remove checkbox from singleAttempt list until it gets same treatment in student app.
		var singleAttempt = ['paper', 'essay', 'radio'];
		if (singleAttempt.indexOf(prob.ansType) !== -1 || isExtendedSingleAttempt(prob.presentation_data)) {
			prob.attemptsMax = 1;
		}

		if (prob.attempts > prob.attemptsMax) {
			prob.attempts = prob.attemptsMax;
			prob.attemptsLeft = 0;
		}
	}


	// Convert graph plotting information from REST payload to needed by kbGraph.

	function convertGraph(graph) {
		var axis = {};
		var eqs = [];
		var eq = '';

		// Create a safety net. This became an issue with the new grid 2 type, which
		// doesn't seem to pass the axis object assumed in the following.
		try {
			if (graph.eqs && graph.eqs.length > 0) {
				var xAxis = graph.axis.x;
				var yAxis = graph.axis.y;
				axis.x = [xAxis.min, xAxis.max, xAxis.step];
				axis.y = [yAxis.min, yAxis.max, yAxis.step];
				eqs = graph.eqs;
				eq = graph.eq;
			}
		} catch (e) {
			console.log('Error converting graph plotting information', e);
		}
		return {
			eq: eq,
			eqs: eqs,
			axis: axis
		};
	}


	// Determines to mode we're in: Multiple students, or multiple problems

	function setMode() {
		// If there's only one problem, it could go either way. Just pick one.
		// multiProblem looks better, so that's our default.
		if (probList.length < 2)
			return 'multiProblem';

		// If the first 2 problems are for the same user, assume they all are.
		if (probList[0].uid === probList[1].uid)
			return 'multiProblem';

		return 'multiStudent';
	}

// These are a direct cut-and-paste from the Assignments problem model.
// Either the model needs to be shared (probably bad), or this functionality
// needs to be moved to a service!

	function cleanEquations(prob) {
		prob.q = cleanMathML(prob.q);
		prob.a = cleanMathML(prob.a);

		for (var i = 0; i < (prob.choices && prob.choices.length); i++)
			prob.choices[i] = cleanMathML(prob.choices[i]);
	}


	// @FIXME/dg: This is causing issues in tags with hyphens.
	// Clean up text nodes only.

	function cleanMathML(str) {
		if (str)
			return str.replace(/-/g, '&#8722;');

		return '';
	}

	// detectWide - attempt to detect wide content in presentation_data.
	// The approach here is to look for line breaks (<br>) in drag-and-drop text.
	// If the text is divided into more than two rows (breaks >= 2), infer that
	// text was designed to be broken deliberately rather than allowed to wrap
	// naturally.
	function detectWide(pd) {
		var wideDetected = false;
		var frames = pd.interactive_frames;
		if (frames) {
			frames.forEach((frame) => {
				if (frame.text && frame.style === 'content_text_drop_box') {
					let rows = frame.text.split(/<br[\s\/]*?>/);
					wideDetected = rows.length > 2;
				}
			});
		}
		return wideDetected;
	}

	// Get rubric data, if present.
	function getRubric(inst_pd, pd) {
		var result = null;
		var rubric = inst_pd && inst_pd.rubric ? inst_pd.rubric : pd.rubric;
		if (rubric) {
			result = rubric;
		}

		return result;
	}

	// Flag for whether or not to display rubric content above problem's correct answer.
	function hasRubric(pd) {
		return pd && !!pd.rubric;
	}

	// Added to allow an isWide flag to be added to a problem, so the layout can be adjusted.
	function isWide(prob) {
		var result = false;
		try {
			if (prob.presentation_data) {
				let frames = prob.presentation_data.interactive_frames;
				if (frames) {
					let hasTable = frames.filter((item) => { return item.isTable; });
					result = hasTable.length > 0 || detectWide(prob.presentation_data);
				}
			}
		} catch (e) {
			console.log('isWide error', e);
		}
		return result;
	}

	function isExtended(pd) {
		return !!(pd && pd.type);
	}

	function isExtendedMultiPart(pd) {
		return !!(pd && pd.type && pd.type === 'multi_part_answer');
	}

	function isExtendedTableItems(pd) {
		return !!(pd && pd.type && pd.type === 'table_items');
	}
	// Check for problem part types (e.g., open_response) in TEI problems. Return true ff a problem contains
	// a part that's single-submission.
	function isExtendedSingleAttempt(pd) {
		var singleStyles = ['open_response'];
		var singleAttempt = false;
		if (pd) {
			if (pd.interactive_frames && Array.isArray(pd.interactive_frames)) {
				singleAttempt = pd.interactive_frames.filter(f => singleStyles.indexOf(f.style) !== -1).length > 0;
			}
		}

		return singleAttempt;
	}

	// Convert AND and OR symbols to text
	var fixAnd = /<mo>(\u2227|&#x2227;|&#8743;)<\/mo>/g;
	var fixOr = /<mo>(\u2228|&#x2228;|&#8744;)<\/mo>/g;
	// Convert - to minus character (&#8722;)
	// Idea is to match -, followed by either a decimal or a digit, but to ignore that character in the match.
	// This way, we can replace the - symbol without affecting the character that follows it.
	var fixMinus = /-(?=\.|\d)/g;
	function cleanAnswer(prob) {
		if (prob.ansType === 'equation') {
			// Split off prefixes and suffixes
			var split = splitEqAnswer(prob.a);
			prob.a = split.a;
			prob.ansPrefix = split.pre && replaceSpaces(split.pre);
			prob.ansSuffix = split.post && replaceSpaces(split.post);

			// Convert AND and OR symbols to text
			prob.a = prob.a.replace(fixAnd, '<mtext>&nbsp;and&nbsp;</mtext>');
			prob.a = prob.a.replace(fixOr, '<mtext>&nbsp;or&nbsp;</mtext>');
		} else if (prob.isExtended) {
			try {
				if (prob.ansType === 'check') { // multiselect: use choices instead of answer.
					prob.choices = TEI.formatA(prob);
				} else {
					prob.a = TEI.formatA(prob);
				}
			} catch (e) {
				console.log('TEI.formatA failed', prob, e);
			}
		}
	}

	// Intended to replace newline characters in submission with <br>. Fixes a bug in which \\n showed up in open response submission.
	function cleanOrigSubmission(sub) {
		var nl = /\\\\n/g;
		if (typeof sub === 'string') {
			sub = sub.replace(nl, '<br>');
		} else if (sub && sub.length) {
			sub.forEach((item, ndx) => {
				sub[ndx] = sub[ndx].replace(nl, '<br>');
			});
		}

		return sub;
	}

	function cleanSubmission(prob) {
		if (prob.ansType === 'equation') {
			// Convert AND and OR symbols to text
			if (prob.submission) {
				prob.submission = prob.submission.replace(fixAnd, '<mtext>&nbsp;and&nbsp;</mtext>');
				prob.submission = prob.submission.replace(fixOr, '<mtext>&nbsp;or&nbsp;</mtext>');
			}
		} else if (prob.ansType === 'essay') {
			// The fixEssaySubmission function uses the approach Mitr takes to cleaning essay responses.
			prob.submission = fixEssaySubmission(prob.submission);
		} else if (prob.isExtended) {
			try {
				if (prob.ansType !== 'check') { // format submission only if not multiselect / checkboxes
					prob.submission = TEI.formatSub(prob);
				}
			} catch (e) {
				console.log('TEI.formatA failed', prob, e);
			}
		}
		prob.submission = prob.submission.replace(fixMinus, '&#8722;');
	}

	// Remove opening and closing &quot; from essay submissions.
	// This is the technique Mitr uses to make essay responses presentable:
	// Actually, it appears that they replace &quot; with "
	// (see core/main/js/helper.js, cleanMML)
	// and then, elsewhere in the code (EOC_templates/common.js, set_solution, "essay" type),
	// trim the first and last characters.
	// Also, remove escaping from MathML tags (well, any tag of the form <m*>).
	// The tags are stored with &lt; &gt; in the db, and Javeed thinks this was done by design
	// but without anticipation that mathml would be used in this context. Because of that,
	// it seems inadvisable to undo the code on the server. Instead, the code can be fixed
	// here.
	// mathMLTagsre does a global search for opening and closing <m*> tags whose < and >
	// have been replaced with &lt; and &gt;. These are converted back to <m*> so that the
	// browser can proces them.

	// Match between &lt; and &gt; tags that start with m, and capture what's between &lt; and &gt;
	// The \/? matches an optional /, so that closing tags are included.
	// The .*? performs an ungreedy match of any character after the m, so that it stops with the first &gt;

	// Submissions from the student app that contain HTML are saved in the db with HTML entities. To prevent
	// these from showing up in the student submission, we substitute the entitles for the corresponding
	// characters. The need to do this became apparent after the MathML tags replacement was already in
	// place and probably makes it unnecessary. Consider removing the mathMLTagsre regular expression and
	// the line that converts all matches to HTML tags.
	var mathMLTagsre = /&lt;(\/?m.*?)&gt;/g;   // Probably unnecessary
	function fixEssaySubmission(str) {
		str = str.replace(/&quot;/g, '');
		str = str.replace(mathMLTagsre, '<$1>'); // Probably unnecessary
		str = str.replace(/&lt;/g, '<');
		str = str.replace(/&gt;/g, '>');
		str = str.replace(/&amp;/g, '&');
		return str;
	}

	// Added to accommodate enhanced problem types having presentation_data.
	function setAnsType(prob) {
		if (prob.presentation_data && prob.presentation_data.type) {
			let presentationType = prob.presentation_data.type;
			// If there's a mapped type for the presentation_data type, use it.
			// Otherwise, default to what's mapped for the problem's specified ansType.
			return ansMap[presentationType] || ansMap[prob.ansType];
		} else {
			return ansMap[prob.ansType];
		}
	}

	function splitEqAnswer(str) {
		str = str.trim();

		if (typeof(str) !== 'string')
			return {a: str};

		var open = findAll('<outside>', str);
		var close = findAll('</outside>', str);

		var errString = 'Prefix/Suffix error!';

		// Tag mismatch or too many tags
		if ((open.length !== close.length) || open.length > 2)
			return {a: errString};

		// No outside tags -- most common occurrence
		if (!open.length)
			return {a: str};

		var outOpen = '<outside>';
		var outClose = '</outside>';
		var pre, post;

		if (open[0] === 0) {
			pre = str.substring(open[0] + outOpen.length, close[0]);
			open.shift();
			close.shift();
		}

		if (close.length && (close[0] === str.length - outClose.length)) {
			post = str.substring(open[0] + outOpen.length, str.length - outClose.length);
			open.shift();
			close.shift();
		}

		// Check for tags not at the start or end of the string
		if (open.length)
			return {a: errString};

		// Strip all outside tags
		var regex = /<outside>.*?<\/outside>/g;
		str = str.replace(regex, '');

		return {
			a: str.trim(),
			pre: pre,
			post: post
		};
	}

	function keepScore(prob) {
		if (prob.scoreMax) {
			scoreObj.scoreMax += parseInt(prob.scoreMax, 10);
		}
		if (isNaN(parseInt(prob.score, 10)) === false) {
			scoreObj.score += parseInt(prob.score, 10);
		}
	}


	// Poor man's XML-safe string replacement
	// This is seriously inadequate, but may be
	// just crazy enough to work.
	//
	// It's likely to cause issues.

	function replaceSpaces(str) {
		if (str[0] === ' ')
			str = '\u00A0' + str;
		if (_.endsWith(str, ' '))
			str += '\u00A0';

		return str;
	}


	// Find all instances of a substring within a string.
	// The return value is an array of indices.

	function findAll(needle, haystack) {
		var out = [];
		var idx = -1;

		while (true) {
			idx = haystack.indexOf(needle, idx + 1);

			if (idx === -1)
				break;

			out.push(idx);
		}

		return out;
	}


	// Look up a problem by ID

	function findProblem(id) {
		for (var i = 0, len = probList.length; i < len; i++) {
			if (probList[i].id === id)
				return probList[i];
		}

		return null;
	}


	// Updates the status. It can't set the pending status, because
	// there is no way to know.

	function getStatus(prob) {
		if (prob.score > 0)
			return 'correct';

		if (prob.attempts >= prob.attemptsMax)
			return 'incorrect';

		return 'new';
	}

	function get() {
		return angular.copy(probList);
	}

	function pendingCount() {
		var cnt = 0;

		for (var i = 0, len = probList.length; i < len; i++) {
			if (probList[i].isPending ||  // Problem requires grading; e.g., essay
					probList[i].status === 'correct' && !probList[i].score) // Problem was graded, but score was accidentally deleted
				cnt++;
		}

		return cnt;
	}

	function inProgressCount() {
		var cnt = 0;

		for (var i = 0, len = probList.length; i < len; i++) {
			if (probList[i].isInProgress)
				cnt++;
		}

		return cnt;
	}

	function setScore(prob, due) {
		var points = ''; // if 'pending'
		if (isPastDue(due) && !prob.points) {
			points = 0;
		} else if (prob.status !== 'pending') {
			points = parseFloat(prob.points);
		}

		return points;
	}

	function setProgressFlag(status, due) {
		var flag = false;
		if (!isPastDue(due) && status === 'new') {
			flag = true;
		}

		return flag;
	}

	function isPastDue(due)	{
		var today = new Date();
		return (due < today);
	}

	function getScore()	{
		return scoreObj;
	}

	function addScores()	{
		scoreObj.score = 0;
		scoreObj.scoreMax = 0;
		probList.forEach(function(p) {
			keepScore(p);
		});
		// score updated here
		PubSub.publish('updateScore', { scoreObj: scoreObj });
		return scoreObj;
	}


	// Returns the total number of problems

	function count() {
		return probList.length;
	}


	// Modifies the score for a single problem
	// Updates the status of the problem based on the result.

	function setPoints(id, pts, partIdx) {
		// Find the problems
		var prob = findProblem(id);
		if (!prob)
			return null;

		// Ensure something is actually changing.
		// If the problem was pending, any change is worth noting.
		if (prob.score === pts && !prob.isPending)
			return null;

		// Set the new score
		prob.score = parseInt(pts, 10);

		var wasPending = prob.isPending;
		prob.isPending = false;
		prob.status = getStatus(prob);	// Since we set the attempts above, it's impossible for this to be 'new' (or 'pending', for other reasons)
		if (wasPending) { // Only adjust Pending tally if the isPending status has changed.
			var pendCnt = pendingCount();   // Get current Pending count
			PubSub.publish('updatePending', {count: pendCnt}); // To maintain Show Pending tally
		}

		$rootScope.$broadcast('save button start');
		// Initiate a background save
		Grade.set({
			aid: prob.aid,
			qid: prob.qid,
			uid: prob.uid,
			partIdx: partIdx,
			grade: pts
		}).then(() => {
			addScores();
			$rootScope.$broadcast('save button end');
		}, () => {
			$rootScope.$broadcast('save button end');
		});

		// Return the new problem instance to the client so they don't have to do all the same calculations
		return angular.copy(prob);
	}

	// setRubricPoints
	function setRubricPoints(id, rubricPoints) {
		var prob = findProblem(id);
		if (!prob)
			return null;
		var rubric = prob.presentation_data.rubric;

		// calculate total from rubric.
		var keys = Object.keys(rubricPoints);
		var grade = 0;
		keys.forEach(k => {
			var row = rubric.rows.find(r => { return r.name === k; });
			if (row) { row.grade = rubricPoints[k];	}
			grade += rubricPoints[k];
		});

		$rootScope.$broadcast('save button start');
		Grade.set({
			aid: prob.aid,
			qid: prob.qid,
			uid: prob.uid,
			grade: grade,
			rubric: rubric
		}).then(() => {
			$rootScope.$broadcast('save button end');
		}, () => {
			$rootScope.$broadcast('save button end');
		});
	}

	function reset() {
		probList = [];
		scoreObj = {
			score: 0,
			scoreMax: 0
		};
	}

	// Public API

	return {
		set: set,
		get: get,
		reset : reset,
		pendingCount: pendingCount,
		inProgressCount: inProgressCount,
		getScore: getScore,
		count: count,
		setPoints: setPoints,
		setRubricPoints: setRubricPoints
	};

};
