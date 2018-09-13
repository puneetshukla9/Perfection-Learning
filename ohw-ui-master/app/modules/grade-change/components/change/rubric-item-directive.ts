'use strict';

export default function() {

  var template = require('./rubric-item.html');

	return {

		restrict: 'E',
		scope: {
      rubricName: '=rubricName',
			rubricItem: '=ngModel',
      rubricGrade: '=rubricGrade',
      problem: '=problem'
		},
		templateUrl: template,
		link: function(scope, element, attrs) {
      var radio = element[0].getElementsByTagName('input')[0];

      function selectRubricItem(problem, name, points) {
        scope.$emit('send-rubric-points', { problem: problem, name: name, points: points });
        scope.checked = true;
        radio.checked = true;
      }

      var item = scope.rubricItem || { text: 'No credit', points: 0 };

      scope.itemPoints = item.points;
      scope.pointsLabel = item.points === 1 ? '(1 point) ' : item.points === 0 ? '' : '(' + item.points + ' points) ';
      scope.text = item.text;

      // Initialize previously assigned points selection for this section of the rubric.
      if (scope.rubricGrade === item.points) {
        selectRubricItem(scope.problem, scope.rubricName, item.points);
      }
      scope.addPoints = function() {
        // When a point value is clicked within a problem's rubric, emit a signal up to the change-controller.
        // The data include the problem ID; rubric section name; and points earned, as determined by the teacher.
        selectRubricItem(scope.problem, scope.rubricName, item.points);
      };

      // Listen for the clear-rubric-selection signal, which is broadcast from rubric-directive once
      // the above send-rubric-points signal is emitted. Note that because broadcasts and emissions are
      // processed synchronously, the scope.selected flag will be set to false for all rubric items within
      // the indicated name before the scope.selected flag is set to true (addPoints, above) for the clicked item.
      scope.$on('clear-rubric-selection:' + scope.rubricName, function(discard, data) {
        scope.checked = false;
      });

		}

	};
};
