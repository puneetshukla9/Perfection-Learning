'use strict';

import scinote from './scinote-service.ts';

export default angular.module('core.scinote', [])
	.service('SciNote', scinote);
