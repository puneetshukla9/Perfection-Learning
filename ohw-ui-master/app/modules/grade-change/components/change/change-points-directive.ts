'use strict';


// Performs MathJax conversion on request (was automatic, but that was TOO SLOW)

export default function($rootScope) {

	var submissionMsgs = {
		'ipractice-graded': 'In this i-Practice assignment, the student completed %attempts% round(s).',
		'ipractice-not-graded': 'In this i-Practice assignment, the student completed %attempts% round(s).',
		'ipractice-in-progress': 'The student is still working on this assignment.',
		'ipractice-no-submission': 'The student did not enter an answer.',
		'test-graded': 'On tests students are allowed 1 submission.',
		'test-not-graded': 'On tests students are allowed 1 submission.',
		'test-in-progress': 'The student is still working on this assignment.',
		'test-in-progress-past-due': 'Past due, and the student did not enter an answer.',
		'graded': 'In this assignment, the student used %attempts% submission(s) out of %attemptsMax% allowed submissions.',
		'not-graded': 'In this assignment, the student used %attempts% submission(s) out of %attemptsMax% allowed submissions.',
		'in-progress': 'The student is still working on this assignment.',
		'in-progress-past-due': 'Past due, and the student did not enter an answer.',
		'no-submissions': 'In this assignment, the student used %attempts% submission(s) out of %attemptsMax% allowed submissions.'
	};

	var template = require('./change-points.html');

	function getPointsState(type, problem) {
		var pointsFieldState = '';
		if (type === 'ipractice') {
			pointsFieldState = 'drill-';
		}

		if (problem.status === 'pending') problem.pts = ''; // Force points on 'pending' problem to blank.
		pointsFieldState += getProblemStatus(problem);

		return pointsFieldState;
	}

	function getProblemStatus(problem) {
		var status = problem.status;
		var due = problem.dueDate;
		var allowMultipleTries = problem.attemptsLeft + problem.attempts > 1;
		var pointsFieldState = '';
		var _pastDue = isPastDue(due);

		if (allowMultipleTries && !_pastDue) {
			pointsFieldState += 'graded';
		} else if (status === 'new' && !_pastDue) {
			pointsFieldState += 'in-progress';
			// not graded
			// in progress (assigned but no answer entered yet)
		} else if (status === 'new' && _pastDue) {
			pointsFieldState += 'no-submission';
			// not graded and past due
			// in progress (assigned but no answer entered yet, and past due)
		} else if (status === 'No submission') {
			pointsFieldState += 'no-submission';
			// not graded and past due
			// in progress (assigned but no answer entered yet, and past due)
		} else if (status === 'correct') {
			pointsFieldState += 'graded';
			// graded; 1+ points earned
		} else if (status === 'incorrect') {
			pointsFieldState += 'graded';
			// graded; 0 points earned
		} else if (status === 'pending') {
			pointsFieldState += 'not-graded';
			// need to grade
		}

		return pointsFieldState;
	}

	function isPastDue(dueDate) {
		var today = new Date();
		var due = new Date(dueDate);
		return (due < today);
	}

	function fillIn(prob, msg) {
		var regexp = /%(.*?)%/;
		var result;
		/* tslint:disable-next-line */
		while ((result = regexp.exec(msg))) {
			var prop = result[1];
			msg = msg.replace(regexp, prob[prop]);
		}
		return msg;
	}

	function submissionMsg(prob) {
		var type = prob.type;
		var status = prob.status;
		var due = prob.dueDate;

		var msgKey = '';
		if (type === 'ipractice' || type === 'test') {
			msgKey += type + '-';
		}

		msgKey += getProblemStatus(prob);

		return function() { /*console.log('submision msg key', msgKey);*/ return fillIn(prob, submissionMsgs[msgKey]); };
	}

	// problemTotalPoints: hash of rubric point values for a given problem.
	// problemTotalPoints[probID][rubricName] = points;
	var problemTotalPoints = {};

	return {
		restrict: 'E',
		scope: {
			problem: '=ngModel',
			answer: '=ptAnswer',
			correct: '=ptCorrect',
			change: '=ptChange',
			idx: '=ptIdx'
		},

		link: function(scope, element, attrs) {

			/*
			 * Mechnism for adding points directly from the rubric:
			 * When receive-rubric-points:[problID] signal is detected, assign the indicated
			 * points to a hash of rubric point values for the problem.
			 * Then, add up the problem's assigned points, and set the pts to the total.
			 * This total is then reflected in the points field on the Grade Change page.
			 */
			function updatePoints(discard, data) {
				var problem = scope.problem;
				if (!problemTotalPoints[problem.probID]) {
					problemTotalPoints[problem.probID] = {};
				}

				problemTotalPoints[data.problem.probID][data.name] = data.points;
				let _total = 0;
				let _keys = Object.keys(problemTotalPoints[data.problem.probID]);
				_keys.forEach(k => {
					_total += problemTotalPoints[data.problem.probID][k];
				});
				scope.problem.pts = _total;
			}

			scope.pointsState = getPointsState(scope.change.type, scope.problem);
			scope.submissionMsg = submissionMsg(scope.problem);
			scope.msgPosition = 'bottom';
			scope.isPastDue = isPastDue(scope.problem.dueDate);
			// Listen for the receive-rubric-points:[probID] signal.
			scope.$on('receive-rubric-points:' + scope.problem.probID, updatePoints);
		},

		templateUrl: template
	};
};
