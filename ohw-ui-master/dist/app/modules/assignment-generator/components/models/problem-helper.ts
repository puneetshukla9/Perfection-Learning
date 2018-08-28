'use strict';

export default function(VTP, SciNote, TEI) {

	// Internal model

	var probBank = probBank || {};		// Bank of problems, indexed by problem ID

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
		'multi_part_answer': 'multi_part_answer'
	};

	// Answer types that only allow a single instance
	var singleQtyOnly = ['radio', 'check'];


	// Icons

	var ansTypeIcons = {
//		freeInput: {icon: 'icon-numericinput', tip: 'Numeric input'},
//		equation: {icon: 'icon-equation-rational', tip: 'Equation input'},
//		check: {icon: 'icon-checkbox', tip: 'Checkbox input'},
//		radio: {icon: 'icon-checkbox', tip: 'Radio input'},
		graphPlot: {icon: 'icon-graphing', tip: 'Graph'},
//		graphConst: {icon: 'icon-graph-trend', tip: 'Graph reading'},
		essay: {icon: 'icon-essay', tip: 'Essay'},
		paper: {icon: 'icon-essay', tip: 'Paper and pencil (manually graded)'},
		multiPart: {icon: 'icon-multi-part', tip: 'Multi-part'},
		tei: {icon: 'icon-tei', tip: 'TEI problem'},

		unknown: {icon: '', tip: ''}
	};

//	var imageIcon = {icon: 'glyphicon-picture', tip: 'Image'};
	var videoIcon = {icon: 'icon-video', tip: 'Video'};
	var stepsIcon = {icon: 'icon-steps', tip: 'Step-by-step help'};
	var VTPIcon = {icon: 'icon-vtp', tip: 'Vary-the-parameter'};
	var TEIIcon = {icon: 'icon-tei', tip: 'Technology Enhanced Item' };


	// Translate server answer types to something more sane

	function transAnswerType(type) {
		if (type && ansMap[type])
			return ansMap[type];

		return type;		// Unknown type, but we need to return something.
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


	function exists(id) {
		return probBank[id];
	}

	function addProblem(prob) {
		var id = prob.probID;

		// Don't add problems that already exist. There's no reason to expect they'd ever be different.
		if (probBank[id])
			return id;

		// Clone the problem
		let parts = cleanSteps(prob.parts);
		var newProb = {
			id: id,
			probID: id,

			prefix: prob.prefix,
			q: prob.q,
			choices: prob.choices,
			qImg: prob.qImg, //fixImagePath(prob.qImg),		// TEMPORARY!!
			overlays: prob.qImageText,

			graph: {eqs: prob.graphequations, axis: prob.graphparms},	// Break this down better

			a: prob.a || '',
			orig_a: prob.a,
//			ansType: transAnswerType(prob.ansType),
			ansType: setAnsType(prob),
			presentation_data: prob.presentation_data,
			isExtended: isExtended(prob.presentation_data),

			parts: parts,

			vars: prob.vars,
			constraints: prob.constraints,
			isVTP: (prob.vars && prob.vars.length > 0),
			ruleType: prob.ruleType,
			hasSteps: prob.hasSteps && prob.ansType !== 'multiPart',
			video: prob.video,

			points: prob.points,
			standards: prob.standards || [],
			orig_submission: prob.submission || ''
		};

		if (isExtendedMultiPart(newProb.presentation_data)) {
			try {
				var part_answers = JSON.parse('[' + newProb.a + ']');
			} catch (e) {
				part_answers = newProb.a;
				console.log('error parsing answer', newProb.probID, newProb.a, e);
			}
			try {
				part_answers = TEI.fixMathML(part_answers);
			} catch (e) {
				console.log('Error attempting fixMathML for part_answers', e, part_answers);
			}
			newProb.orig_a = part_answers;
			//newProb.extendedParts = ExtendedProblemTypes.getExtendedParts(newProb, part_answers);
		}

		// Perform any necessary conversion/cleanup
		cleanQuestion(newProb);
		cleanEquations(newProb);	// Top level only, for now
		cleanAnswer(newProb);		// Top level only, for now

		// VTP the problem (if it isn't a VTP problem, data is copied over)
		try {
			VTP.eval(newProb);
		} catch (e) {
			console.log('VTP.eval error', e, newProb);
		}

		// Do this after VTP
		cleanGraph(newProb);	// This needs to work on steps, too!

		// Add icons (this is large and wasteful, but quicker)
		newProb.icons = getIcons(newProb);

		// Deal with sorting by tag
		var sortOrder = _.values(prob.tags);
		if (sortOrder.length)
			newProb.sortOrder = sortOrder[0];

		// Scientific Notation tweak
		try {
			SciNote.editTweak(newProb);
		} catch (e) {
			console.log('SciNote.editTweak error', e, newProb);
		}

		// Add it to our databank
		probBank[id] = newProb;

		return id;
	}


	//

	function cleanEquations(prob) {
		// @FIXME/dg: Disabled for now. This MUST be done in XML mode. We can't convert minuses in variable blocks (unless we undo it later)
//		prob.q = cleanMathML(prob.q);
//		prob.a = cleanMathML(prob.a);

		for (var i = 0; i < (prob.choices && prob.choices.length); i++)
			prob.choices[i].a = cleanMathML(prob.choices[i].a);
	}


	//

	function cleanMathML(str) {
		if (str) {
			// Prevent converting the - in 'no-print' to a minus sign.
			var tmp = str.replace(/no-print/g, '#!!noPrint!!#');
			tmp = tmp.replace(/-/g, '&#8722;');
			return tmp.replace(/#!!noPrint!!#/g, 'no-print');
		}

		return '';
	}


	function isExtended(pd) {
		return !!(pd && pd.type);
	}

	function isExtendedMultiPart(pd) {
		return !!(pd && pd.type && pd.type === 'multi_part_answer');
	}

	function cleanQuestion(data) {
		if (data.isExtended) {
			try {
				data.q = TEI.formatQ(data);
			} catch (e) {
				console.log('cleanQuestion faield', e, data.probID);
			}
		}
	}

	//
	function cleanAnswer(data) {
		if (data.ansType === 'equation' && data.a) {
			// Split off prefixes and suffixes
			var split = splitEqAnswer(data.a);
			data.a = split.a;

			data.ansPrefix = split.pre && replaceSpaces(split.pre);
			data.ansSuffix = split.post && replaceSpaces(split.post);

			// Convert AND and OR symbols to text
			var fixAnd = /<mo>(\u2227|&#x2227;|&#8743;)<\/mo>/g;
			var fixOr = /<mo>(\u2228|&#x2228;|&#8744;)<\/mo>/g;
			data.a = data.a.replace(fixAnd, '<mtext>&nbsp;and&nbsp;</mtext>');
			data.a = data.a.replace(fixOr, '<mtext>&nbsp;or&nbsp;</mtext>');
		} else if (data.isExtended) {
			try {
				data.a = TEI.formatA(data);
			} catch (e) {
				console.log('cleanAnswer failed', e);
			}
		}
	}


	// Remove tags (VTP-generated spans) from equations

	function cleanGraph(data) {
		if (data.graph && data.graph.eqs && data.graph.eqs.length) {
			var base = data.vtp.graph.eqs;
			for (var i = 0, len = base.length; i < len; i++)
				base[i] = base[i].replace(/<[^>]+>/g, '');
		}
	}


	//

	function cleanSteps(steps) {
		if (!steps || !steps.length)
			return null;

		var out = [];

		angular.forEach(steps, function(step) {
			var outStep = {
				prefix: step.q_prefix,
				q: step.q,
				ansType: transAnswerType(step.ansType),
				a: step.a,
				choices: step.choices,
				graph: {eqs: step.graphequations, axis: step.graphparms	} // Break this down better
			};

			cleanEquations(outStep);
			cleanAnswer(outStep);

			out.push(outStep);
		});

		return out;
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


	// Poor man's XML-safe string replacement
	// This is seriously inadequate, but may be
	// just crazy enough to work.

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


	// Returns a list of relevant icons for a given problem

	function getIcons(prob) {
		var out = [];

		// Answer Type
		var ansIcon = ansTypeIcons[prob.ansType] || ansTypeIcons.unknown;
		out.push(ansIcon);

		if (prob.video) out.push(videoIcon);

		// Steps
		if (prob.hasSteps) out.push(stepsIcon);

		// VTP
		if (prob.isVTP) out.push(VTPIcon);

		// Enhanced problem Types
		if (prob.isExtended) out.push(TEIIcon);

		return out;
	}


	// Get a number of uniquely VTPed instances of a problem

	function getInstances(id, qty) {
		qty = parseInt(qty, 10);

		if (isNaN(qty) || qty < 1)
			return [];

		// Start with the first instance
		var out = [probBank[id]];

		// Now add additional instances
		var seeds = [probBank[id].vtp.seed];

		for (var i = 1; i < qty; i++) {
			// Clone the primary instance
			var cloned = angular.copy(probBank[id]);

			// Remove previous VTP information
			delete cloned.vtp;

			// Do the VTP
			try {
				VTP.eval(cloned, seeds);
			} catch (e) {
				console.log('VTP.eval error', e);
			}

			// Save the results
			out.push(cloned);
			seeds.push(cloned.vtp.seed);
		}

		return out;
	}


	// Public API

	return {
		exists: function(id) {
			return exists(id);
		},
		// Return a problem instance
		get: function(id) {
			if (probBank[id])
				return probBank[id];					// Cloning is too slow and not necessary

			return null;
		},
		// Return a list of problem instances
		getMany: function(list) {
			var out = [];
			for (var i = 0, len = list.length; i < len; i++)
				out.push(probBank[list[i]]);
			return out;
		},

		// Get a number of uniquely VTPed instances of a problem
		getInstances: getInstances,
		initProbBank: function() {
			probBank = {};
		},
		add: function(prob) {
			return addProblem(prob);
		},
		// Bulk Add to the data bank
		addMany: function(probs) {
			var refList = [];
			angular.forEach(probs, function(aProb) {
				refList.push(addProblem(aProb));
			});
			return refList;
		},
		// Does it make sense to allow more than one instance of
		// this type of problem?
		canSetQty: function(ansType) {
			return (singleQtyOnly.indexOf(ansType) === -1);
		}
	};

};
