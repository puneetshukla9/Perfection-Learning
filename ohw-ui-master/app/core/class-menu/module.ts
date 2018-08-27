'use strict';

import classMenu from './class-menu-directive.ts';
import './class-menu.less';

export default angular.module('core.classmenu', [])
	.directive('classMenu', classMenu);
