'use strict';

import './dialog.less';

import dialogController from './dialog-controller.ts';
import userSelectController from './user-select-controller.ts';
import dialogService from './dialog-service.ts';

export default angular.module('admin.dialog', [])
	.service('kbDialog', dialogService)
	.controller('dialogCtrl', dialogController)
	.controller('SelectUserModalCtrl', userSelectController);
