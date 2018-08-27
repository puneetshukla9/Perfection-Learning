'use strict';

import userMenu from './user-menu-directive.ts';

export default angular.module('core.usermenu', [])
	.directive('userMenu', userMenu);
