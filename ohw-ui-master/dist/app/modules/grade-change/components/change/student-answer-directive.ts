'use strict';


// Performs MathJax conversion on request (was automatic, but that was TOO SLOW)

export default function() {

	var template = require('./student-answer.html');

	function isPastDue(dueDate) {
		var today = new Date();
		var due = new Date(dueDate);
		return (due < today);
	}

	function getIsInProgress(problem, isPastDue) {
		var answerSubmitted = !!problem.submission;
		// var allowMultipleTries = problem.attemptsLeft + problem.attempts > 1;
		// var newProblem = problem.status === 'new';
		// In progress:

		// "new" problem AND
		// Not past due AND
		// Does not allow multiple tries.

		// After discussing with Phil:
		// Display "In progress" only if a) not past due, and b) no answer submitted
		return (!isPastDue && !answerSubmitted);
	}

	function getStatusFlags(problem, isPastDue) {
		var answerSubmitted = !!problem.submission;
		// After discussing with Phil:
		// Display "In progress" only if a) not past due, and b) no answer submitted
		// Display "No answer submitted" if a) past due, and b) no answer submitted
		var flags = {
			isInProgress: !isPastDue && !answerSubmitted,
			isNoAnswerSubmitted: isPastDue && !answerSubmitted,
			showAnswer: answerSubmitted
		};
		return flags;
	}

	return {
		restrict: 'E',
		scope: {
			problem: '=ngModel',
			answer: '=ptAnswer',
			correct: '=ptCorrect'
		},

		link: function(scope, element, attrs) {
			scope.isPastDue = isPastDue(scope.problem.dueDate);

			var statusFlags = getStatusFlags(scope.problem, scope.isPastDue);

			scope.isInProgress = statusFlags.isInProgress;
			scope.isNoAnswerSubmitted = statusFlags.isNoAnswerSubmitted;
			scope.showAnswer = statusFlags.showAnswer;
		},

		templateUrl: template
	};
};
