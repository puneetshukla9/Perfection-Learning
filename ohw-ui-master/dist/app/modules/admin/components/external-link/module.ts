'use strict';

import externalLinkController from './external-link-controller.ts';

export default angular.module('admin.external', [])
	.controller('ExternalCtrl', externalLinkController);
