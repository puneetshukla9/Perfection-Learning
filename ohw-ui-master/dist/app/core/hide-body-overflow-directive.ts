'use strict';

import * as $ from 'jquery';

export default function($timeout, $state) {

		return {
			restrict: 'A',
			scope: true,
			priority: 1003,	// other directives take precedence
			link: function(scope, elem, attrs) {
				// is ui grid loaded on the page?
				scope.$on('$stateChangeSuccess', function() {
					var args = scope.$eval(attrs.hideBodyOverflow);
					if (!args.length) return;
					if (args.indexOf($state.$current.name) >= 0) {
						$(elem).addClass('hide-body-fixed');
					} else {
						$(elem).removeClass('hide-body-fixed');
					}
				});
			}
		};

	};
