'use strict';

import './user-menu.less';
var template = require('./user-menu.html');

export default function(AppState) {

		return {
			restrict: 'A',
			scope: {},
			templateUrl: template,
			replace: true,
			link: function(scope, elem, attrs) {
				scope.name = AppState.get('user_name');
				scope.$watch(function() {
					return AppState.get('user_name');
				}, function(newValue) {
					scope.name = newValue;
				});
			}
		};

	};
