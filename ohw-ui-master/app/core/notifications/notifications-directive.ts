'use strict';

var template = require('./notifications.html');
import * as $ from 'jquery';

export default function($rootScope, $timeout, NotificationsConfig, NotificationsInterceptor) {

    var TIMEOUT_LENGTH = 2500;

    return {
  		restrict: 'E',
  		templateUrl: template,
  		replace: true,
      scope: {},
      link: function(scope, element, attrs) {

        scope.view = {};
        scope.view.visible = false;

        scope.$on('notification close', function(e, payload) {
          $timeout(function() { scope.view.visible = false; }, 0);
        });

        scope.$on('notification error', function(e, payload) {
          console.log('error: ', payload);
		  $timeout(() => {
			scope.view = {
	            type: 'error',
	            header: 'Application Error',
	            message: payload.message ? payload.message : 'Sorry, we had a problem.',
	            visible: true
	          };
		  });
          if (!payload.sticky) $timeout(function() { scope.view.visible = false; }, TIMEOUT_LENGTH);
        });

        scope.$on('notification confirmation', function(e, payload) {
          console.log('success: ', payload);
		  $timeout(() => {
	          scope.view = {
	            type: 'confirmation',
	            header: 'Application Confirmation',
	            message: payload.message ? payload.message : 'Success!',
	            visible: true
	          };
            if (payload.messageLine2) {
              scope.view.messageLine2 = payload.messageLine2;
            }
		  });
          if (!payload.sticky) $timeout(function() { scope.view.visible = false; }, TIMEOUT_LENGTH);
        });

        $(element).find('#notifications-close').on('click', function(e) {
          $timeout(function() { console.log(scope); scope.view.visible = false; }, 0);
        });
  		}

  	};

};
