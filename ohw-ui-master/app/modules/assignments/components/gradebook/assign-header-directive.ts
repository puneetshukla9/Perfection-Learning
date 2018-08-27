'use strict';

export default function(PubSub, AppState, $state) {

  var assignDecor = {
	  'homework': { bg: 'bg-success', icon: 'icon-h' },
	  'quiz': { bg: 'bg-warning', icon: 'icon-q' },
	  'quizboard': { bg: 'bg-warning', icon: 'icon-q' },
	  'test': { bg: 'bg-danger', icon: 'icon-t' },
	  'quickcheck': { bg: 'bg-danger', icon: 'icon-q' },
	  'ipractice': { bg: 'bg-info', icon: 'icon-p' },
	  'virtual lab': { bg: 'bg-info', icon: 'icon-h' }
	};

  var hideDateTypes = ['quickcheck', 'quizboard', 'virtual lab'];
  
	function displayName(type) {
		var map = {
			'ipractice': 'iPractice',
			'homework': 'Homework',
			'test': 'Test',
			'quiz': 'Quiz'
		};
		return map[type];
	}

	function pendingClick(event, num) {
		event.stopPropagation();
		event.preventDefault();
		PubSub.publish('GradeMe', num);
	}

	function linkToPending(assignId) {
		return function() {
			$state.go('gradeChangeApp.pendingAssign', { assign: assignId });
		};
	}

  function getShowDate(type) {
    return hideDateTypes.indexOf(type) === -1;
  }

	return {
		restrict: 'E',
		replace: true,
		templateUrl: require('./assign-header.html'),
		scope: {
			num: '@',
			assignId: '@',
			name: '@',
			due: '@',
			points: '@',
			type: '@',
			pending: '@',
			avg: '@'
		},
		link: (scope, elem, attrs) => {
			var today = new Date();
			var now = today.getTime();
			if (scope.name === 'PAST DUE') {
				console.log('directive link: ', scope.name, scope.avg);
			}
			// Convert string to Date object for filtering
			scope.dueDate = new Date(scope.due);

			scope.isPending = parseInt(scope.pending, 10) ? true : false;
			scope.isInProgress = (now < scope.dueDate.getTime());

			scope.assignBgColor = assignDecor[scope.type].bg;
			scope.assignIcon = assignDecor[scope.type].icon;
      scope.showDate = getShowDate(scope.type);

			// Inject a click handler into the scope (using a controller would probably be cleaner)
			scope.click = pendingClick;
			scope.linkToPending = linkToPending(scope.assignId);
			scope.displayName = displayName;
		}
	};

};
