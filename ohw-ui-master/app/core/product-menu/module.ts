'use strict';

import menuDirective from './product-menu-directive.ts';

export default angular.module('core.productmenu', [])
	.directive('productMenu', menuDirective);
