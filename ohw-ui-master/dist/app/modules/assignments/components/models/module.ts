'use strict';

import assignmentList from './assignment-list-model.ts';
import classRoster from './class-roster-model.ts';
import gradebook from './grades-model.ts';
import standard from './standard-service.ts';

export default angular.module('assign.models', [])
	.service('AssignmentList', assignmentList)
	.service('ClassRoster', classRoster)
	.service('Gradebook', gradebook)
	.service('Standard', standard);
