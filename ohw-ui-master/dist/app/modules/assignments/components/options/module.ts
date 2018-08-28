'use strict';

import dropLowest from './drop-lowest-controller.ts';
import dueSettings from './due-settings-controller.ts';
import gradeWeight from './grade-weight.ts';

import './grade-weight.less';
import './drop-lowest.less';

export default angular.module('assign.options', [])
	.controller('DropLowestCtrl', dropLowest)
	.controller('DueSettingsCtrl', dueSettings)
	.service('GradeWeightCtrl', gradeWeight);
