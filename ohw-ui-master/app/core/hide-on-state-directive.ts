'use strict';

import * as $ from 'jquery';

export default function($state) {

		return {
			restrict: 'A',
			scope: true,
			link: function(scope, elem, attrs) {
				scope.$on('$stateChangeSuccess', function() {
					var args = scope.$eval(attrs.hideOnState);
					if (!args.length) return;
					if (args.indexOf($state.$current.name) >= 0) {
						$(elem).hide();
					} else {
						$(elem).show();
					}
				});
			}
		};

	};
