'use strict';

export default function() {
		return {
			restrict: 'A',
			scope: {
				'items': '='
			},
			controller: 'PreferenceMenuCtrl as pref',
			templateUrl: require('./preference-menu.html'),
			replace: true
		};
	};
