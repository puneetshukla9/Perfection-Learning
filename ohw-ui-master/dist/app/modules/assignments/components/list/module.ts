'use strict';

import studentSelectCtrl from './student-select-controller';
import listCtrl from './list-controller';
import deleteConfirmCtrl from './delete-confirm-controller';
import assignImportCtrl from './import-assignment-controller';
import assignmentListSort from './assignment-list-sort-filter';

import './list.less';

export default angular.module('assign.list', [])
	.controller('DeleteConfirmCtrl', deleteConfirmCtrl)
	.controller('AssignImportCtrl', assignImportCtrl)
	.controller('ListCtrl', listCtrl)
	.controller('StudentSelectCtrl', studentSelectCtrl)
	.filter('AssignmentListSort', assignmentListSort);
