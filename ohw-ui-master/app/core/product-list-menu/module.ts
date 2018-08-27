'use strict';

import productListMenu from './product-list-menu-directive.ts';
import './product-list-menu.less';

export default angular.module('core.productlistmenu', [])
	.directive('productListMenu', productListMenu);
