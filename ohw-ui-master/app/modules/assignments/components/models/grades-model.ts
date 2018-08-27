'use strict';

export default function(Course, $q) {

	var grades;

	function formatData(data) {
		var out = {
			assigns: [],
			students: [],
			sections: {},		// List of sections found in data. Used to construct the filter list.
			averages: [[], []]	// Stores averages and possible
		};

		// Pre-sort by assignment
		data.assignments = _.sortBy(data.assignments, function(entry) {
			return new Date(entry.due);
		});

		// Translate student data
		_.forEach(data.students, function(entry) {
			out.students.push({
				id: entry.id,
				name: entry.last + ', ' + entry.first,
				section: entry.section,
				total: 0,			// Used for calculations later
				points: [],			// Used for calculations later
				studentID: entry.student_num // to test: use entry.id
			});

			out.sections[entry.section] = true;
		});

		// Translate assignment data
			var assignIdx = 0;

		_.forEach(data.assignments, function(entry, idx) {
			var assignedDate = new Date(entry.assigned);
			var today = new Date();
			var now = today.getTime();

			// Only show assignments when the assigned date and time has passed:
			if (assignedDate.getTime() < now) {
				var isPending = (entry.pending.indexOf(true) !== -1); // for entire assigment if any student has pending grade

				out.assigns.push({
					id: entry.id,
					name: entry.name,
					due: new Date(entry.due),
					assigned: assignedDate,
					type: entry.type,
					points: entry.points,
					sortOrder: entry.sortOrder,
					isSubAssign: entry.isSubAssign,
					subSetAssigned: entry.subSetAssigned,
					pending: isPending,			// Boolean, covering the entire assignment
					pendingList: entry.pending	// This is an array, with one entry per student
				});

				var assign = out.assigns[out.assigns.length - 1];
//				assign.inProgress = (assignedDate.getTime() < now && now < assign.due.getTime());
				assign.inProgress = assignedDate.getTime() >= now;
				assign.notYetDue = (assignedDate.getTime() < now && now < assign.due.getTime());

				if (!entry.pending.length && !entry.problems.length) {// student never logged in:
					var Students = data.students.length;
					while (Students)
						setGrades(assign, out.students[--Students], -1, assignIdx, false);
				} else {
					_.forEach(entry.problems, function(score, stIdx) { // Add score data to student data:
						setGrades(assign, out.students[stIdx], score, assignIdx, entry.pending[stIdx]);
					});
				}
				assignIdx++;
			}
		});

		return out;
	}

	function setStudentAverage(gradeData, drop, weights)	{

		var classTotalGrades = 0;
		for (var stIdx = 0, stLen = gradeData.students.length; stIdx < stLen; stIdx++)	{
			var score = getScore(gradeData.assigns, gradeData.students[stIdx], drop, weights);
			gradeData.students[stIdx].grade = score.percent + '%';
			classTotalGrades += score.percent;
		}
		gradeData.averages[0].grade = gradeData.students.length ? Math.round(classTotalGrades / gradeData.students.length) + '%' : '0%';
	}


	function setGrades(assign, student, score, assignIdx, pending) {
		var assignKey = 'Assignment ' + assignIdx;

    if (assign.isSubAssign && assign.subSetAssigned.indexOf(+student.id) === -1) {
			// If for a subset of students, show 'N/A' for those not included.
			student[assignKey] = 'N/A';
			student.points.push(-9999); // mark this points setting for omission from averages and totals.
		} else if (assign.inProgress) {
			// Display '--' if the assignment is between the assigned and due dates
			//						and the student has not completed the assignment:
			student[assignKey] = '--';
			student.points.push(0);
		} else if (pending) { // Display '!' for assignments that are past due with problems that need grading:
			student[assignKey] = '!';
			student.points.push(0);
		} else {
			if (score === -1) // this should not be necessary, but manually changed due date on backend would cause this
				score = 0;
			if (score === 0) { // prevent NaN
				student[assignKey] = '0%';
			} else {
				student[assignKey] = Math.round(100 * score / assign.points) + '%';
			}
			student.points.push(score);				// Point value saved for later calculations
		}
	}


	var weightMap = {
		homework: 'hw',
		ipractice: 'ip',
		quiz: 'quiz',
		test: 'test'
	};


	// Get the final grade

	function getScore(assigns, studentData, drop, weights)	{
		studentData.dropped = [];

		// Weight values
		var list = [], score, possible;
		for (var asnIdx = 0, asnLen = assigns.length; asnIdx < asnLen; asnIdx++) {
			//if (!assigns[asnIdx].inProgress) {
			if (!assigns[asnIdx].notYetDue) {
				possible = assigns[asnIdx].points;
				score = studentData.points[asnIdx];

				// Perform weighting
				var type = weightMap[assigns[asnIdx].type];
				if (weights.enabled) {
					score *= weights[type] / 100;
					possible *= weights[type] / 100;
				}

				list.push({score: score, possible: possible, canDrop: drop[type], origIdx: asnIdx});
			}
		}

		// Drop lowest (we're dropping by percentage, so weighting won't affect it)
		var dropCount = drop.count;
		while (dropCount > 0) {
			var idx = dropLowest(list);
			if (idx !== -1)
				studentData.dropped.push(idx);		// Save the list of dropped items, for visual marking

			dropCount--;
		}

		// Sum
		score = 0;
		possible = 0;
		for (var i = 0, len = list.length; i < len; i++) {
			// This is for omitting n/a students from averages.
			if (list[i].score >= 0) {
			  score += list[i].score;
			  possible += list[i].possible;
			}
		}

		//var totalGrade = grades.totalPts ? (score/grades.totalPts) : 0; // use this to verify the total:
		var total = possible ? (score / possible) : 0;		// Divide by 0 protection
		return {
			score: Math.round(score),
			possible: Math.round(possible),
			percent: Math.round(total * 100)
		};
	}


	// Needs to calc percentage

	function dropLowest(list) {
		var lowest = 999999;		// Arbitrary high number
		var lowestIdx = -1;
		var origIdx = -1;
		var score;

		for (var i = 0, len = list.length; i < len; i++) {
			score = list[i].score / list[i].possible;
			if (list[i].canDrop && score < lowest) {
				lowest = score;
				lowestIdx = i;
			}
		}

		if (lowestIdx !== -1) {
			origIdx = list[lowestIdx].origIdx;		// We need the original index, since the list is being changed
			list.splice(lowestIdx, 1);
		}

		return origIdx;		// For marking assignments
	}


	function setAssignmentAverage(gradeData, section) {
		var classAvg = 0;
		var classPossiblePtsAvg = 0;
		gradeData.totalPts = 0;

		// Step through assignments, summing values for students that match the filter
		for (var asnIdx = 0, asnLen = gradeData.assigns.length; asnIdx < asnLen; asnIdx++) {
			var assign = gradeData.assigns[asnIdx];
			var score = 0;
			var count = 0;

			// Step through each student
			for (var stIdx = 0, stLen = gradeData.students.length; stIdx < stLen; stIdx++) {
				var student = gradeData.students[stIdx];
				if (section === 'All' || student.section === section) {
					// If assignment is for subset of students, n/a students will have been given negative points and so can be omitted for averaging.
					if (student.points[asnIdx] >= 0) {
					  score += student.points[asnIdx];
					  count++;
					}
				}
			}

			var aid = 'Assignment ' + asnIdx;
			var avg = count && assign.points && (score / count / assign.points);

			classAvg += avg;
			classPossiblePtsAvg += assign.points;

			gradeData.averages[0][aid] = Math.round(avg * 100) + '%'; // footer upper row
			gradeData.averages[1][aid] = assign.points + ' pts'; // footer lower row

			if (!assign.inProgress) {
				gradeData.totalPts += assign.points;
			}
		}

		 // footer summery column:
//		grades.averages[0]['grade'] = Math.round(classAvg / grades.assigns.length * 100) + '%';
		gradeData.averages[1].grade = gradeData.totalPts + ' pts';
	}

	function load(id, assignmentFilter)	{
		var deferred = $q.defer(); // Create a shadow promise to allow for data cleanup

		var gradebookSettings = {
			pending: true,
			compacted: true,
			assigned_date: true,
			past_due_only: false
		};
		Course.getGradebook(id, gradebookSettings).then(function(data) {
			if (assignmentFilter.length > 0) {
				data.data.assignments = data.data.assignments.filter((item) => {
					return assignmentFilter.indexOf(item.type) !== -1;
				});
			}
			grades = formatData(data.data);
			deferred.resolve(grades);
		}, function(err) {
			deferred.reject(err);
		});

		return deferred.promise;
	}

	function get() {
		return grades;
	}

	return {
		load: load,
		get: get,
		setStudentAverage: setStudentAverage,
		setAssignmentAverage: setAssignmentAverage
	};

};
