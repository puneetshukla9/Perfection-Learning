'use strict';

var template = require('./spinner.html');

export default function($rootScope, $timeout, SpinnerConfig, SpinnerInterceptor) {

    return {
  		restrict: 'E',
  		templateUrl: template,
  		replace: true,
      scope: {},
      link: function(scope, element, attrs) {
        scope.view = {};
        scope.$on('spinner hide', function(e, payload) {
          scope.view.visible = false;
        });
        scope.$on('spinner show', function(e, payload) {
          scope.view.visible = true;
        });
  		}
  	};

};
