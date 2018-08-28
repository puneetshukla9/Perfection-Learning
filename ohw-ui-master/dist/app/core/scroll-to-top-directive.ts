'use strict';

import * as $ from 'jquery';

export default function($timeout) {
		return {
			restrict: 'A',
			scope: true,
			priority: 1000,
			link: function(scope, elem, attrs) {
				scope.$on('$stateChangeSuccess', function() {
					// $timeout(() => {
						document.body.scrollTop = 0;
						document.documentElement.scrollTop = 0;
					// }, 500);
				});
			}
		};
	};
