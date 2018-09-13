'use strict';

export default function() {

  var template = require('./rubric.html');

	return {

		restrict: 'E',
		scope: {
			problem: '=ngModel',
			rubric: '=ptRubric'
		},
		templateUrl: template,
		link: function(scope, element, attrs) {
      console.log('rubric-directive, rubric, presentation_data', scope.rubric, scope.problem.presentation_data);
      // Listen for the send-rubric-points emission from rubric-item-directive.
      // When this is received, broadcast the clear-rubric-selection signal for
      // the particular name in which the rubric item was clicked. This is done
      // to clear all of the item selections before setting the flag for the
      // clicked one. It would, admittedly, seem more efficient to remember the
      // most recent selection and just clear that one.
      scope.$on('send-rubric-points', function(discard, data) {
        scope.$broadcast('clear-rubric-selection:' + data.name, data);
      });
		}

	};
};
