'use strict';

import headerDirective from './header-bar-directive.ts';

export default angular.module('core.header', [])
	.directive('headerBar', headerDirective);
