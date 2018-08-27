'use strict';

import * as $ from 'jquery';

export default function($state) {

		return {
			restrict: 'A',
			scope: true,
			link: function(scope, elem, attrs) {
				scope.$on('$stateChangeSuccess', function() {
					var args = scope.$eval(attrs.hideOnRoute);
					if (!args.length) return;
					var path = window.location.pathname; // $state.current.url;
					var show = true;
					_.each(args, (arg, i) => {
						if (arg && /\*/.test(arg)) {
							var result = arg.replace(/\*/, '');
							if (path.indexOf(result) >= 0) {
								show = false;
								return false;
							}
						} else {
							if (arg === path) {
								show = false;
								return false;
							}
						}
					});
					if (show) {
						$(elem).show();
					} else {
						$(elem).hide();
					}
				});
			}
		};

	};
