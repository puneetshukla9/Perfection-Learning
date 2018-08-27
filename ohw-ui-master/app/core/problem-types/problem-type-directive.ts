'use strict';

import * as $ from 'jquery';

export default function(AppState, $state) {

	var ASSIGN_GEN_TEMPLATES = './templates/assignment-generator/';
	var GRADE_CHANGE_TEMPLATES = './templates/grade-change/';

	var map = {
		assignGenApp: {
			freeInput: {
				q: require(ASSIGN_GEN_TEMPLATES + 'free-input-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'free-input-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'free-input-ap.html')
			},

			equation: {
				q: require(ASSIGN_GEN_TEMPLATES + 'equation-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'simple-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'simple-a.html')
			},

			check: {
				q: require(ASSIGN_GEN_TEMPLATES + 'multi-choice-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'multi-choice-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'multi-choice-a.html')
			},

			radio: {
				q: require(ASSIGN_GEN_TEMPLATES + 'multi-choice-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'multi-choice-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'multi-choice-a.html')
			},

			paper: {
				q: require(ASSIGN_GEN_TEMPLATES + 'essay-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'simple-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'simple-a.html')
			},

			essay: {
				q: require(ASSIGN_GEN_TEMPLATES + 'essay-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'simple-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'simple-a.html')
			},

			graphPlot: {
				q: require(ASSIGN_GEN_TEMPLATES + 'graph-plot-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'graph-plot-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'graph-plot-a.html')
			},

			graphConst: {
				q: require(ASSIGN_GEN_TEMPLATES + 'graph-const-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'graph-const-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'graph-const-a.html')
			},

			multiPart: {
				q: require(ASSIGN_GEN_TEMPLATES + 'multi-part-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'multi-part-a.html'),
				ap: require(ASSIGN_GEN_TEMPLATES + 'multi-part-a.html')
			},

			dragDrop: {
				q: require(ASSIGN_GEN_TEMPLATES + 'drag-drop-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'drag-drop-a.html')
			},

			matching: {
				q: require(ASSIGN_GEN_TEMPLATES + 'matching-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'matching-a.html')
			},
			multi_part_answer: {
				q: require(ASSIGN_GEN_TEMPLATES + 'multi-part-q.html'),
				a: require(ASSIGN_GEN_TEMPLATES + 'multi-part-a.html')
			}
		},
		gradeChangeApp: {
			freeInput: {
				q: require(GRADE_CHANGE_TEMPLATES + 'free-input-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'free-input-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'free-input-ap.html')
			},

			equation: {
				q: require(GRADE_CHANGE_TEMPLATES + 'equation-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'equation-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'simple-a.html')
			},

			check: {
				q: require(GRADE_CHANGE_TEMPLATES + 'multi-choice-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'multi-choice-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'multi-choice-a.html')
			},

			radio: {
				q: require(GRADE_CHANGE_TEMPLATES + 'multi-choice-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'multi-choice-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'multi-choice-a.html')
			},

			paper: {
				q: require(GRADE_CHANGE_TEMPLATES + 'essay-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'simple-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'simple-a.html')
			},

			essay: {
				q: require(GRADE_CHANGE_TEMPLATES + 'essay-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'simple-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'simple-a.html')
			},

			graphPlot: {
				q: require(GRADE_CHANGE_TEMPLATES + 'simple-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'graph-plot-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'graph-plot-a.html')
			},

			graphConst: {
				q: require(GRADE_CHANGE_TEMPLATES + 'graph-const-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'graph-const-a.html')
				// ap: require(GRADE_CHANGE_TEMPLATES + 'graph-const-a.html')
			},
			multiPart: {
				q: require(GRADE_CHANGE_TEMPLATES + 'simple-q.html')
				// a: require(GRADE_CHANGE_TEMPLATES + 'multi-choice-a.html'),
				// ap: require(GRADE_CHANGE_TEMPLATES + 'multi-part-a.html')
			},

			dragDrop: {
				q: require(GRADE_CHANGE_TEMPLATES + 'drag-drop-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'drag-drop-a.html')
			},

			matching: {
				q: require(GRADE_CHANGE_TEMPLATES + 'matching-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'matching-a.html')
			},
			multi_part_answer: {
				q: require(GRADE_CHANGE_TEMPLATES + 'multi-part-q.html'),
				a: require(GRADE_CHANGE_TEMPLATES + 'multi-part-a.html')
			}
		}
	};

	function numToLetter(num, useLowercase) {
		var offset = useLowercase ? 97 : 65;
		return String.fromCharCode(offset + num);
	}

	// Display part number
	function showPartNum(num, useLowercase) {
		var fmt = numToLetter(num, useLowercase) + '. ';
		return fmt;
	}

	return {

		restrict: 'E',
		scope: {
			problem: '=ngModel',
			answer: '=ptAnswer',
			correct: '=ptCorrect',
			showQuestions: '=ptQuestions',
			showStandards: '=ptStandards'
		},
		template: '<div ng-include="getTemplate()"></div>',
		link: function(scope, element, attrs) {
			scope.getTemplate = function() {
				scope.showAnswers = attrs.ptMode === 'a';
				var mode = attrs.ptMode;
				var type = scope.problem.ansType;
				var modName = AppState.getModuleName($state.current);
				var template;
				try {
					template = map[modName][type][mode];
				} catch (e) {
					console.log('problem-type-directive modName, type, mode', modName, type, mode);
				}
				return template;
			};
			scope.numToLetter = numToLetter;
			scope.showPartNum = showPartNum;
		}

	};
};
