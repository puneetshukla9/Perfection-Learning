'use strict';

// Requests data calculation for a given report.
// Formats the data into a shared location, and adds in extra info the view may need.
export default function(GradeData, CategoryModel, StandardModel, Preferences, State, $rootScope) {
	var _tmpEl = document.createElement('div');

	function assignOverview(id, dest, filters) {
		if (!id) return;

		var cats = CategoryModel.get();

		// Add filters
		filters = cleanFilters(filters);
		var data = GradeData.getByCategory(id, filters);

		dest.categories = _.map(data, function(entry, key) {
			var cat = _.find(cats, {id: key});
			var grade = entry.possible ? (entry.sum / entry.possible) : 0;

			return {
				id: key,
				entry: cat.text,
				value: grade
			};
		});
	}

	function standardOverview(id, dest, filters) {
		if (!id) return;

		// Add filters
		filters = cleanFilters(filters);
		var data = GradeData.getByStandard(id, filters);

		dest.standards = [];
		 _.forEach(data, function(entry, stdId) {
			var std = StandardModel.getTopLevel(stdId);
			var grade = entry.possible ? (entry.sum / entry.possible) : 0;

			dest.standards.push({
				id: stdId,
				entry: std.short_name || std.code,	//std.code,
				value: grade
//				full: std.desc,
//				abbreviated: std.abbrev,
			});
		});
	}

	function assignList(id, dest, filters) {
		if (!id) return;

		filters = cleanFilters(filters);
		var data = GradeData.getAssignList(id, filters);
		var catMap = CategoryModel.getMap();
		var overallSum = 0, overallMax = 0;

		dest.assigns = _.map(data, function(entry) {
			overallSum += entry.totalSum;
			overallMax += entry.totalPossible;
			var average = entry.totalPossible ? (entry.totalSum / entry.totalPossible) : 0;

			return {
				name: entry.name,
				assignNameSort: prepVal(entry.name),
				due: new Date(entry.due),
				type: catMap[entry.type].name,
				icon: catMap[entry.type].icon,
				points: entry.possible,
				probs: entry.cnt,
				average: average,
				isSubAssign: entry.isSubAssign,
				subSetAssigned: entry.subSetAssigned,

				score: +entry.totalSum.toFixed(1),	// For single student mode (not accurate when there are multiple students!)
				possible: +entry.possible,			// For single student mode

				bar: {
					excel: entry.excel,
					pass: entry.pass,
					fail: entry.fail,
					id: entry.id,				// Used for click handler
					average: average			// Dupe, but needed here as well
				}
			};
		});

		// Overall total, for the bottom of the page
		dest.assignAvg = overallMax ? (overallSum / overallMax) : 0;
	}

	function standardList(id, dest, filters) {
		if (!id) return;

//		var activeType = State.get('curStandardType');

		filters = cleanFilters(filters);
		var data = GradeData.getStandardList(id, filters);
		var standards = StandardModel.getMap();

		var overallSum = 0, overallMax = 0;

		dest.stdList = _.map(data, function(entry, stdId) {
			var std = standards[stdId];

			overallSum += entry.totalSum;
			overallMax += entry.totalPossible;
			var average = entry.totalPossible ? (entry.totalSum / entry.totalPossible) : 0;

			// Add
			return {
				name: std.code,
				stdCodeSort: prepVal(std.code),
				fullName: std.name,
				points: entry.totalPossible,
				probs: entry.cnt,
				average: average,

				score: +entry.totalSum.toFixed(1),	// For single student mode (not accurate when there are multiple students!)
				possible: +entry.totalPossible,			// For single student mode (not accurate when there are multiple students!)

				bar: {
					excel: entry.excel,
					pass: entry.pass,
					fail: entry.fail,
					average: average,			// Dupe, but needed here as well
					id: stdId					// Used for click handler
				}
			};

		});

		// Overall total, for the bottom of the page
		dest.standardAvg = overallMax ? (overallSum / overallMax) : 0;
	}

	function assignStudents(id, dest, filters) {
		if (!id) return;

		filters = cleanFilters(filters);
		var data = GradeData.getStudentAssigns(id, filters);

		var overallSum = 0, overallCnt = 0;

		dest.studentScores = _.map(data, function(entry, id) {
			overallSum += entry.score;
			overallCnt += entry.possible;
			var average = entry.possible ? (entry.score / entry.possible) : 0;

			return {
				id: id,						// Used for click handler
				name: entry.first + ' ' + entry.last,
				average: average,
				correct: entry.correct,
				total: entry.cnt,
//				score: Math.round(entry.score),		// Looks bad for decimal scores, but they should be rare
				score: +entry.score.toFixed(1),		// Round to at most 1 decimal place -- is this what we want?
				possible: entry.possible
			};
		});

		// Overall total, for the bottom of the page
		dest.assignAvg = (overallCnt ? overallSum / overallCnt : 0);
	}

	// Calculate the class or student score for each problem
	// Tie the problems to the scores so they will always be in sync.
	function assignProblems(id, dest, filters) {
		if (!id) return;

		filters = cleanFilters(filters);
		var data = GradeData.getStudentProblems(id, filters);
		dest.problems = _.map(data, function(entry) {
			var avg = entry.possible ? (entry.score / entry.possible) : 0;

			return {
				id: entry.id,					// Used for click handler

				// Filled in by post-calculation function
//				prefix: dest.problems[probId].prefix,
//				q: dest.problems[probId].q,

				standard: StandardModel.getText(filters.standard),
					// This is slower and larger than I'd like. If we don't allow high-level standards, we can just display the current filter
				assign: entry.assign,
				num: entry.num,

				average: avg,
				score: +entry.score.toFixed(1),		// Round to at most 1 decimal place -- is this what we want?
				possible: entry.possible,

				bar: {
					excel: entry.excel,
					pass: entry.pass,
					fail: entry.fail,
//					id: probId,
					average: avg			// Dupe, but needed here as well
				},

				lists: entry.lists
			};

//			dest.problems[probId].average = entry.possible ? (entry.score / entry.possible) : 0;
		});
	}

	// Prepare sorting. Similar code to kbSort.
	function prepVal(rawVal) {
			var pad = '00000000';

		// zero-pad first group of digits in string.
		var preppedVal = rawVal.replace(/(\d+)/g, function(val) {
			return pad.substr(0, pad.length - val.length) + val;
		});
		return preppedVal;
	}

	// Clean up the filters
	function cleanFilters(filters) {
		filters = filters || {};

		// Date range filters are IDs. Replace with the actual record.
		if (filters.range) {
			var allRanges = Preferences.get('dateRanges');
			var range = _.find(allRanges, {id: filters.range});

			filters.range = {
				start: new Date(range.start),
				end: new Date(range.end)
			};
		}

		// Some filters can get set to 'all'. Delete those.
		_.forEach(['student', 'category', 'assign', 'standard'], function(filt) {
			if (filters[filt] === 'all')
				delete filters[filt];
		});

		// Map some assignment filters to category filters, e.g. "all_homework"
		if (filters.assign && filters.assign.substring(0, 4) === 'all_') {
			filters.category = filters.assign.substring(4);
			delete filters.assign;
		}

		return filters;
	}

	// Public API
	return {
		assignOverview: assignOverview,
		standardOverview: standardOverview,

		assignList: assignList,
		standardList: standardList,

		assignStudents: assignStudents,

		assignProblems: assignProblems
	};

};
