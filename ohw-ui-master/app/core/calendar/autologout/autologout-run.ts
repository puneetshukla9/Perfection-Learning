'use strict';

import * as $ from 'jquery';

export default function(kbAutologoutConfig, $location, $http, $uibModal, $timeout, $rootScope)  {

	if (window.ohw.allowAutoLogout === false) {
		console.log('calendar autologout disabled');
		return;
	} else if (window.location.search.indexOf('autologout=debug') >= 0) {
		console.log('autologout testing mode');
		kbAutologoutConfig.IDLE_TRIGGER = 30;
	}

	var handle;

	$rootScope.$on('autologout', function(data) {
		var modal = $uibModal.open({
			templateUrl: require('./autologout.html'),
			controller: 'AutologoutController',
			size: 'md',
			resolve: {
				handle: function() { return handle; }
			}
		});
		modal.result.then(function() {
			$timeout.cancel(handle);
			startTimeout();
	});
  });

	// stop using the pings, etc. altogether and just use a timeout
	function startTimeout() {
		handle = $timeout(function() {
			$rootScope.$broadcast('autologout');
		}, kbAutologoutConfig.IDLE_TRIGGER * 1000);
	}

	$(document.body).on('mousemove scroll keyup', function(e) {
		$timeout.cancel(handle);
		startTimeout();
	});

	startTimeout();

};
