'use strict';

import './actions.less';

import actionsDirective from './actions-directive.ts';
import actionsController from './actions-controller.ts';
import actionsCallbacks from './helpers/actions-callbacks-factory.ts';
import actionsConfig from './config/actions-config.ts';

export default angular.module('admin.actions', [])
	.constant('kbActionBarPath', {
		path: 'actions/'
	})
	.factory('ActionsCallbacks', actionsCallbacks)
	.factory('ActionsConfig', actionsConfig)
	.controller('ActionBarController', actionsController)
	.directive('actions', actionsDirective);
