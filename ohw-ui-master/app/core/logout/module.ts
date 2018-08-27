'use strict';

import logoutCtrl from './logout-controller.ts';

export default angular.module('core.logout', [])
	.controller('LogoutCtrl', logoutCtrl);
