'use strict';

// This module performs all the data crunching for grade calculations
export default function(GradeRanges, CategoryModel, StandardModel, State) {

	// Potentially huge
	var grades = {};

	// Get references to all assigns for a given category, all problems for a given standard
	// Score for each assignment, for each student
	// Average score for each assignment
	// Average score for each category

	// List of categories -- Cache internally for speed
//	var catList = CategoryModel.categoryList();

	var ranges = GradeRanges.get();
	var excel = ranges.excel / 100;
	var pass = ranges.pass / 100;

	// Check if grade data for a given class exists
	function exists(id) {
		return (!needToRefresh(id) && typeof (grades[id]) !== 'undefined');
	}

	// Use this to check for need to refresh, based on grade changes.
	function needToRefresh(id) {
		return true;
	}

	// Check for assignment given to subset of students.
	function checkForPartialAssignment(data) {
		_.forEach(data.assignments, (asg) => {
			var studentIdx = [];
			// If assignment is given to subset of students, compile student index list.
			if (asg.isSubAssign) {
				_.forEach(data.students, (stu, idx) => {
					var id = parseInt(stu.id, 10);
					if (asg.subSetAssigned.indexOf(id) !== -1) {
						studentIdx.push(idx);
					}
				});
			} else {
				studentIdx = null;
			}
			// Do this bit only if assignment is given to a subset of students.
			if (studentIdx !== null) {
				_.forEach(asg.problems, (problem, idx) => {
					if (studentIdx.indexOf(idx) === -1) {
						delete asg.problems[idx];
					}
				});
			}
		});
	}

	// Too big to clone. Deal with it.
	function set(id, data) {
		grades[id] = data;
		checkForPartialAssignment(data);
		// Perform date conversion, for easier date range comparisons
		_.forEach(grades[id].assignments, function(asn) {
			asn.due = new Date(asn.due);
		});
	}

	// Returns a list of indices in the student list that
	// don't pass our filter criteria.
	//
	// Valid filters:
	//	Student: Return scores for a single student (overrides Section filter)
	//	Section: Limit scores to students in a single section (mutually exclusive with Student filter)
	function studentExcludeFilter(list, filters) {
		var out = [];
		var i, len;

		// Single student mode -- This has the most overhead, but it's balanced by smaller data and number crunching.
		if (filters.student) {
			for (i = 0, len = list.length; i < len; i++) {
				if (list[i].id !== filters.student)	// Allow type conversion. We might be comparing numbers and strings.
					out.push(i);
			}
		} else if (filters.section) {
			for (i = 0, len = list.length; i < len; i++) {
				if (list[i].section !== filters.section)	// Allow type conversion. We might be comparing numbers and strings.
					out.push(i);
			}
		}

		return out;
	}

	// Checks if a given assignment passes our filter criteria.
	//
	// Valid filters:
	//	Category: Limit the list to a single assignment type
	//	Date range: Limit to assignments in a given date range
	function assignFilterTest(entry, filters) {
		// Assignment ID -- If a given ID is requested and this is a match,
		// ignore all other filters.
		if (filters.assign) {
			return (entry.id === filters.assign);	// Type insensitive
		}
		// Assignment type (category) test
		if (filters.category && entry.type !== filters.category)
			return false;

		// Date range test
		if (filters.range && (entry.due < filters.range.start || entry.due > filters.range.end))
			return false;

		// All filters have been passed. Yay!
		return true;
	}

	// Checks if a given list of standards passes our filter criteria
	//
	// "list" is an array of standard IDs
	//
	// Returns a subset of that list that matches the supplied filters.
	//
	// Valid filters:
	//	Standard: Limit to problems in with a given top-level standard
	function problemFilterTest(list, filters) {
		var i, len;
		if (filters.standard) {
			var out = [];

			// There are two different types of standard filters:
			//	id: This is a low-level standard
			//	p_id: This is a top-level standard
			if (filters.standard.substring(0, 2) !== 'p_') {
				for (i = 0, len = list.length; i < len; i++) {
					if (list[i] === filters.standard)
						out.push(list[i]);
				}
			} else {
				var parent = parseInt(filters.standard.substring(2), 10);
				for (i = 0, len = list.length; i < len; i++) {
					// Get the parent for this ID
					if (StandardModel.getParent(list[i]) === parent)	// Type insensitive, just in case
						out.push(list[i]);
				}
			}

			if (out.length)
				return out;		// Instead of returning true, send the standards that are a match. It will save time later.
			return false;		// No matches. Fail!
		}

		// All filters have been passed. Yay!
		return list;
	}

	function iterateOverProblems(id, filters, state) {
		if (!state.out)
			state.out = [];

		// Ensure that ID is valid
		if (!grades[id] || !grades[id].assignments)
			return state.out;

		// Figure out which students we care about
		var studentExclude = studentExcludeFilter(grades[id].students, filters);
		var excludeIdx;
		var record = {};		// Share a single object for callback param passing

		// Step through our assignment list, updating totals
		var type, asn, match;
		var target = grades[id].assignments;
		for (var as = 0, alen = target.length; as < alen; as++) {
			if (!assignFilterTest(target[as], filters))
				continue;

			record.assign = target[as];
			if (state.assignInit) state.assignInit(record);

			// Step through each student
			// "problems" is an array with one entry per student. Each entry is an array of one entry per problem.
			excludeIdx = 0;		// We'll step through the studentExclude list linearly instead of using indexOf repeatedly

			// If no problems have been answered, mark all as failed.
			if (target[as].problems.length === 0 && Array.isArray(state.out)) {
				var last = _.last(state.out);
				last.possible = _.sum(target[as].points);
				for (var st = 0, slen = grades[id].students.length; st < slen; st++) {
					updateRange(0, last);
				}
			}

			for (var st = 0, slen = target[as].problems.length; st < slen; st++) {
				// Ensure this student passes our filters
				if ((excludeIdx < studentExclude.length) && studentExclude[excludeIdx] === st) {
					excludeIdx++;
					continue;
				}

				record.student = grades[id].students[st];
				record.studentIdx = st;
				record.probs = asn = (target[as].problems[st] || []);
				if (state.studentInit) state.studentInit(record);

				// Step through each problem in the assignment for this student
				for (var pr = 0, plen = asn.length; pr < plen; pr++) {
					// Ensure we care about this problem
					match = problemFilterTest(target[as].standard[pr], filters);
					if (match) {
						record.id = target[as].problem_ids[pr];
						record.problemIdx = pr;
						record.score = (asn[pr] === -1 ? 0 : asn[pr]);
							// -1 means unanswered. Convert to 0 points. Send in an isAnswered flag if the client needs to know.
						record.points = target[as].points[pr];
						record.standard = target[as].standard[pr];
						record.matched = match;
						if (state.addScore) state.addScore(record);
					}
				}

				// We're done with this student (for this assignment only -- we'll be back for the next one)
				if (state.postStudent) state.postStudent(record);
			}
		}

		// Perform any final calculations
		if (state.postIterate) state.postIterate(record);

		return state.out;
	}

	// Determines the problem count for each standard in
	// the data bank.
	//
	// This bears an unfortunate similarity to iterateOverProblems
	// We're doing a lot of duplicate work, but combining the
	// two would be quite messy.
	function standardCount(id, filters) {
		var standards = StandardModel.getMap();

		var match;
		var out = {};
		var target = grades[id] && grades[id].assignments || [];
		for (var i = 0, alen = target.length; i < alen; i++) {
			if (!assignFilterTest(target[i], filters))	// Skip assignments we aren't interested in
				continue;

			// Step through each standard in the assignment
			for (var stdIdx = 0, stdLen = target[i].standard.length; stdIdx < stdLen; stdIdx++) {
				// Get a list of matching standards (that we care about)
				match = problemFilterTest(target[i].standard[stdIdx], filters);

				if (!match)
					continue;

				// Increment the count for each
				for (var matchIdx = 0, len = match.length; matchIdx < len; matchIdx++) {
					var standID = match[matchIdx];
					if (standards[standID]) {
						out[standID] = (out[standID] || 0) + 1;
					}
				}
			}
		}
		return out;
	}

	// Returns the average score for each assignment type
	//
	// Valid filters:
	//	Section: Limit scores to students in a single section (mutually exclusive with Student filter)
	//	Date range: Limit to assignments in a given date range
	//
	// Student and category also work, but don't need to.
	function getByCategory(id, filters) {
		var state = {
			out: {}
		};

		// Initialize the output for this type, if it hasn't been done yet
		state.assignInit = function(info) {
			if (!state.out[info.assign.type])
				state.out[info.assign.type] = {sum: 0, possible: 0};
		};

		// Update the score for a single problem
		state.addScore = function(info) {
			state.out[info.assign.type].sum += info.score;
			state.out[info.assign.type].possible += info.points;
		};

		return iterateOverProblems(id, filters, state);
	}

	// Returns a list of assignments average scores
	//
	// Valid filters:
	//	Category: Limit the list to a single assignment type
	//	Student: Return scores for a single student (overrides Section filter)
	//	Section: Limit scores to students in a single section (mutually exclusive with Student filter)
	//	Date range: Limit to assignments in a given date range
	function getAssignList(id, filters) {
		var state = {
			out: []
		};

		// Initialize the output for this assignment
		state.assignInit = function(info) {
			state.out.push({
				id: info.assign.id,
				name: info.assign.name,
				type: info.assign.type,
				due: info.assign.due,
				isSubAssign: info.assign.isSubAssign,
				subSetAssigned: info.assign.subSetAssigned,

				totalSum: 0,	// Total points earned in each assignment, for all students
				totalPossible: 0,

				possible: 0,	// Max points for this assignment
				cnt: 0,			// Number of problems in this assignment
//				average: 0,		// Average score across all students (calculated externally, but should be in here)

				excel: 0,
				pass: 0,
				fail: 0
			});
		};

		// Update the problem count for this assignment type
		state.studentInit = function() {
			state.total = 0;	// Running total of earned points for this assignment & student
			state.possible = 0;	// Running total of possible points for this assignment & student
		};

		// Update the score for a single problem
		state.addScore = function(info) {
			// We use temp storage to avoid have to do _.last for each problem
			state.total += info.score;
			state.possible += info.points;
		};

		// Update results data
		state.postStudent = function(info) {
			var last = _.last(state.out);

			// We'll overwrite these for every student. It's the same every time.
			// It's easiest to determine as we go, though.
			last.possible = state.possible;
			last.cnt = info.probs.length;

			// Update running totals (for the average of averages)
			last.totalSum += state.total;
			last.totalPossible += state.possible;

			// Calculate average, classify
			if (last.possible > 0) {
				var avg = state.total / last.possible;
				updateRange(avg, last);
			}
		};

		return iterateOverProblems(id, filters, state);
	}

	// Valid filters:
	//	Section: Limit scores to students in a single section (mutually exclusive with Student filter)
	//	Assignments: Return scores for a single assignment (doesn't matter if the assignment is outside of the date range)
	//	Date range: Limit to assignments in a given date range
	function getStudentAssigns(id, filters) {
		var state = {
			out: {}
		};

		// Prep the output data
/*
		var students = grades[id].students;
		_.forEach(students, function(std) {
			state.out.push({
				id: std.id,
				first: std.first,
				last: std.last,
				cnt: 0,			// Problems
				correct: 0,		// Correct (score > 0)
				score: 0,		// Earned points
				possible: 0,	// Max possible points
			});
		});
*/

		// Standards in the assignment; used in calculating scores: only problems with standards in this list should be counted.
		var assignStds = standardCount(id, filters);

		var applyStandardFilter = function() {
			var reportView = State.get('curReportView');
			return reportView === 'stdstd';
		};

		// Update the score for a single problem
		state.addScore = function(info) {
			if (applyStandardFilter()) {
				var hasStandard = info.standard.filter(function(item) { return assignStds[item]; });
				if (!hasStandard.length) return;
			}
			if (!state.out[info.student.id]) {
				state.out[info.student.id] = {
//r					id: std.id,
					first: info.student.first,
					last: info.student.last,
					cnt: 0,			// Problems
					correct: 0,		// Correct (score > 0)
					score: 0,		// Earned points
					possible: 0	// Max possible points
				};
			}

			state.out[info.student.id].score += info.score;
			state.out[info.student.id].possible += info.points;
			state.out[info.student.id].cnt++;

			if (info.score > 0)
				state.out[info.student.id].correct++;
		};

		return iterateOverProblems(id, filters, state);
	}

	// Returns the average score for each top-level standard
	//
	// Valid filters:
	//	Section: Limit scores to students in a single section (mutually exclusive with Student filter)
	//	Date range: Limit to assignments in a given date range
	//
	// Student and category also work, but don't need to.
	function getByStandard(id, filters) {
		var state = {
			out: {}
		};

		var standards = StandardModel.getMap();

		// Update the score for a single problem.
		state.addScore = function(info) {

			// Each problem can have 0 or more standards.
			// A problem with multiple standards can be represented in multiple entries.
			for (var i = 0, len = info.standard.length; i < len; i++) {
				var id = info.standard[i];
				var top = standards[id] && standards[id].parent;

				// Ensure a standard exists for this ID (it should, but only if the type is one we care about)
				// Also, we only care about one category. If this standard ID isn't in the category, forget it!
				if (top !== undefined) {
					if (typeof (state.out[top]) === 'undefined') {
						state.out[top] = {sum: info.score, possible: info.points};	// If a given standard is seen for the first time, create a new entry.
					} else {
						state.out[top].sum += info.score;
						state.out[top].possible += info.points;
					}
				}
			}
		};

		return iterateOverProblems(id, filters, state);
	}

	// Returns a list of standards represented by the assignments
	//
	// This is now a bit more complex than it needs to be.
	// When it was first written, addScore wasn't called for
	// every problem so we needed standardCount to get the
	// correct count. It could now be rewritten without standardCount,
	// maintaining an accurate running count as it scans.
	// Performance may (or may not) improve slightly, and the code
	// in getStandardList would grow a bit (though the entire file
	// would shrink overall.) Since it's currently working, let's
	// leave it as is until there's a compelling reason to change it.
	//
	// Valid filters:
	//	Standard: Limit the list to a single top-level standard
	//	Student: Return scores for a single student (overrides Section filter)
	//	Section: Limit scores to students in a single section (mutually exclusive with Student filter)
	//	Date range: Limit to assignments in a given date range
	function getStandardList(id, filters) {
		var state = {
			out: {},
			std: {}
		};

		var standards = StandardModel.getMap();

		// This pass only gathers data
		state.addScore = function(info) {

			// Each problem can have 0 or more standards.
			// We're using "matched" to ensure we only add to state.out for standards that pass our filter
			for (var i = 0, len = info.matched.length; i < len; i++) {
				var id = info.matched[i];
				var std = standards[id];

				// Ensure a standard exists for this ID
				// Also, we only care about one category. If this standard ID isn't in the category, forget it!
				if (std) {
					// Create a blank entry for this standard if it doesn't exist yet
					if (typeof (state.std[id]) === 'undefined')
						state.std[id] = {};

					if (typeof (state.std[id][info.studentIdx]) === 'undefined') {
						state.std[id][info.studentIdx] = { sum: info.score, possible: info.points };
							// If a given standard is seen for the first time, create a new entry.
					} else {
						state.std[id][info.studentIdx].sum += info.score;
						state.std[id][info.studentIdx].possible += info.points;
					}
				}
			}
		};

		// Sum up the totals for each student
		state.postIterate = function(info) {

			// Step through our list of standards
			_.forEach(state.std, function(students, stdId) {

				// Step through student scores for this standard
				_.forEach(students, function(data) {

					// Update global values
					state.out[stdId].totalSum += data.sum;
					state.out[stdId].totalPossible += data.possible;

					// Update range information
					if (data.possible) {
						var avg = data.sum / data.possible;
						updateRange(avg, state.out[stdId]);
					}
				});
			});
		};

		// Initialize standard counts and destination data structure
		var counts = standardCount(id, filters);
		_.forEach(counts, function(cnt, stdId) {
			state.out[stdId] = {
				code: standards[stdId].code,
				cnt: cnt,

				totalSum: 0,	// Total points earned in each assignment, for all students
				totalPossible: 0,

				excel: 0,
				pass: 0,
				fail: 0
			};
		});

		return iterateOverProblems(id, filters, state);
	}

	function getStudentProblems(id, filters) {
		var state = {
			out: {}
		};

		state.addScore = function(info) {
			var id = info.assign.id + '_' + info.problemIdx;	// Store output data using a combo key: assignment ID + problem index

			if (typeof (state.out[id]) === 'undefined') {
				state.out[id] = {score: 0, possible: 0, lists: {excel: [], pass: [], fail: []}};
			}
			state.out[id].id = info.id;
			state.out[id].score += info.score;
			state.out[id].possible += info.points;
			state.out[id].assign = info.assign.name;
			state.out[id].num = info.problemIdx;

			// Update student performance on this problem.
			// Since the same problem can occur multiple times, we need to tally all results for a given student before
			// we can assign them to a performance range.
			var dest = state.out[id].lists;

			var avg = info.points ? (info.score / info.points) : 0;
			var range = pickRange(avg);
			dest[range].push({
				score: info.score,
				possible: info.points,
				avg: avg,				// Easy to duplicate and wasting memory, but we already calculated it
				first: info.student.first,
				last: info.student.last
			});
		};

		// For each problem, add each student to the correct
		// performance range.
		state.postIterate = function(info) {

			_.forEach(state.out, function(prob, key) {
				prob.excel = Object.keys(prob.lists.excel).length;
				prob.pass = Object.keys(prob.lists.pass).length;
				prob.fail = Object.keys(prob.lists.fail).length;
			});
		};

		return iterateOverProblems(id, filters, state);
	}

	// Update the correct range band given a score.
	// Assumes that helper variables were already set globally (yucky, but efficient)
	function updateRange(score, dest) {
		if (score >= excel) {
			dest.excel++;
		} else if (score >= pass) {
			dest.pass++;
		} else {
			dest.fail++;
		}
	}

	function pickRange(score) {
		if (score >= excel) {
			return 'excel';
		} else if (score >= pass) {
			return 'pass';
		} else {
			return 'fail';
		}
	}

	function getAssigns(id) {
		return grades[id].assignments;
	}

	// Public API
	return {
		exists: exists,
		set: set,
		getAssigns: getAssigns,
		getStandards: standardCount,

		getByCategory: getByCategory,
		getAssignList: getAssignList,

		getByStandard: getByStandard,
		getStandardList: getStandardList,

		getStudentAssigns: getStudentAssigns,
		getStudentProblems: getStudentProblems
	};

};
