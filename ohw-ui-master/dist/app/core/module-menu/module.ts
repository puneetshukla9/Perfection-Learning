'use strict';

import moduleMenu from './module-menu-directive.ts';
import './module-menu.less';

export default angular.module('core.modulemenu', [])
	.directive('moduleMenu', moduleMenu);
