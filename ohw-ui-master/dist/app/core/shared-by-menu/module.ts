'use strict';

import sharedByMenu from './shared-by-menu-directive.ts';
import './shared-by-menu.less';

export default angular.module('core.sharedbymenu', [])
	.directive('sharedByMenu', sharedByMenu);
