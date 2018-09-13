'use strict';

import './grid/gradebook-grid.less';
import './gradebook.less';

import assignHeaderDirective from './assign-header-directive.ts';
import gradebookController from './gradebook-controller.ts';

export default angular.module('assign.gradebook', [])
	.directive('assignHeader', assignHeaderDirective)
	.controller('GradebookCtrl', gradebookController);
