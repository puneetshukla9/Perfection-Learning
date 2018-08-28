'use strict';

import * as $ from 'jquery';

export default function($timeout) {
		return {
			restrict: 'A',
			priority: 1000,
			scope: {},
			link: function(scope, elem, attrs) {
				scope.$watch(attrs.triggerClick, (n, o) => {
					if (n === o) return;
					$(elem).dispatchEvent(new MouseEvent('click', {
					 'view': window,
					 'bubbles': true,
					 'cancelable': true
					}));
				});
			}
		};
	};
