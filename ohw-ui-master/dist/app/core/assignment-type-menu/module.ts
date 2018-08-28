'use strict';

import assignmentTypeMenu from './assignment-type-menu-directive.ts';
import './assignment-type-menu.less';

export default angular.module('core.assignmenttypemenu', [])
	.directive('assignmentTypeMenu', assignmentTypeMenu);
