'use strict';

import * as $ from 'jquery';

export default function($timeout) {
		return {
			restrict: 'A',
			scope: true,
			priority: 1001,	// the scroll-to-top directive takes precedence
			link: function(scope, elem, attrs) {
				// is ui grid loaded on the page?
				scope.$on('$viewContentLoaded', function() {
					if (window.ohw.allowAutoLogout !== false) {
						$timeout(() => {
							var body = $('body');
							if (body.find('div[ui-grid]').length) {
								// grid on page
								body.addClass('fixed');
							} else {
								body.removeClass('fixed');
							}
						});
					} else {
						console.log('snap to grid directive timeout disabled');
					}
				});
			}
		};
	};
