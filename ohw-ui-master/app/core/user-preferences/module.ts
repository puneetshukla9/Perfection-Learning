'use strict';

import preferenceMenu from './preference-menu-directive.ts';
import preferences from './preferences-factory.ts';
import preferenceMenuCtrl from './preference-menu-controller.ts';

export default angular.module('core.preferences', [])
	.directive('preferenceMenu', preferenceMenu)
	.factory('Preferences', preferences)
	.controller('PreferenceMenuCtrl', preferenceMenuCtrl);
