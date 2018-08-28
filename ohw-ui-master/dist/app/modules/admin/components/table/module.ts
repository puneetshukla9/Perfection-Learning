'use strict';

import './table.less';
import table from './table-controller.ts';

export default angular.module('admin.table', [])
	.controller('kbTableCtrl', table);
