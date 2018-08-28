'use strict';

import autologoutController from './autologout-controller.ts';
import autologoutRun from './autologout-run.ts';

angular.module('core.autologout', [])
	.controller('AutologoutController', autologoutController)
	.constant('kbAutologoutConfig', {
		PATH: 'autologout/',
		URL_QUERY: '/autologout_endpoint.php/idle_time',
		URL_PING: '/autologout_endpoint.php/ping',
		PING_TIME: 60, // 60 seconds
		IDLE_TRIGGER: 3600, // 3600 seconds
		COUNTDOWN_LENGTH: 10 // 10 seconds
	})
	.run(autologoutRun);
