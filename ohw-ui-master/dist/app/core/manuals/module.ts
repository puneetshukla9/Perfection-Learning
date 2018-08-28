'use strict';

import './manuals.less';
import ManualsCtrl from './manuals-controller.ts';

export default angular.module('core.manuals', [])
	.controller('ManualsCtrl', ManualsCtrl);
