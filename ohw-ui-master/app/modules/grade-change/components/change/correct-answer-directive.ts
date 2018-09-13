'use strict';

// Performs MathJax conversion on request (was automatic, but that was TOO SLOW)

export default function() {

	var template = require('./correct-answer.html');

	return {
		restrict: 'E',
		scope: {
			problem: '=ngModel',
			answer: '=ptAnswer',
			correct: '=ptCorrect',
			rubric: '=ptRubric'
		},
		templateUrl: template
	};

};
