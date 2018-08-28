'use strict';

var template = require('./assignment-type-menu.html');

export default function($q, AppState, Course, CourseHelper, $rootScope, State, PubSub, $timeout) {

		var recentAssignmentType; // To allow assignment type menu to remember the last selection
		var setAssignmentTypeFilter = function(assignmentType) {
        $rootScope.$broadcast('assignment filter', {assignmentType: assignmentType});
		};

		return {
			restrict: 'A',
			scope: true,
			templateUrl: template,
			replace: true,
			link: function(scope, elem, attrs) {
				scope.visible = true;
				scope.assignmentTypes = ['Assessments', 'Quick Checks', 'Quizboards', 'Virtual Labs'];

				var userId = AppState.get('user_id');
				var loaded = loaded || false;

				if (!loaded) {
					if (!recentAssignmentType) {
						// Default assignment type
						scope.assignmentType = 'Assessments';
						loaded = true;
					} else {
						// Recall most recently selected assignment type.
						scope.assignmentType = recentAssignmentType;
						setAssignmentTypeFilter(scope.assignmentType);
					}
				}

				// changed from menu
				scope.handleAssignmentTypeChange = () => {
					// Store assignment type selection.
					recentAssignmentType = scope.assignmentType;
					setAssignmentTypeFilter(scope.assignmentType);
				};

			}
		};

	};
