'use strict';

export default function(Auth, AppState, $scope, $rootScope,
  	$http, $interval, $timeout, handle, $uibModalInstance, $state, kbAutologoutConfig) {

    var self = this;

    $scope.view = {};
    $scope.view.remaining = kbAutologoutConfig.COUNTDOWN_LENGTH;
    $scope.view.expired = false;

    $scope.continue = function() {
      $timeout.cancel(handle);
			$interval.cancel(self.handle);
      $uibModalInstance.close();
		};

    $scope.login = function() {
      $interval.cancel(self.handle);
      $timeout.cancel(handle);
      window.location.href = AppState.get('url')('login');
    };

    $scope.init = function() {
      self.handle = $interval(function() {
        $scope.view.remaining--;
        if ($scope.view.remaining === 0) {
          $timeout.cancel(handle);
          $rootScope.$broadcast('notification close'); // cleanup open notifications
          $scope.view.expired = true;
          $state.go('logout');
        }
      }, 1000);
    };

    $scope.init();

  };
