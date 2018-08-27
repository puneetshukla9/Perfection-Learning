'use strict';

var template = require('./actions.html');

export default function(kbActionBarPath, $window) {
		return {
			restrict: 'E',
			scope: {
				model: '=ngModel',
				ctrl: '=ctrl'
			},
			templateUrl: template,
			controller: 'ActionBarController as actionBarCtrl',
			replace: true,
			link: function(scope, element, attrs) {
				scope.onResize = function() {
					scope.windowHeight = $window.innerHeight;
					var tableHeight = scope.windowHeight - 230;
				};
				scope.onResize();
				angular.element($window).bind('resize', function() {
					scope.onResize();
					scope.$apply();
				});
			}
		};

};
