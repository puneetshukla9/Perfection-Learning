'use strict';

export default function($scope, $state, $window, $timeout, $stateParams) {

    $scope.isPrinting = false;
    $scope.data = $stateParams.data;

	// prevent direct accessibility of this path
	if (!$scope.data) {
		$state.previous.name ? $state.go($state.previous.name) : $state.go('adminApp.classes.classesList');
	}

	$scope.back = function() {
		$state.go($state.previous.name);
	};

	$scope.print = function() {
		$scope.isPrinting = true;
		$timeout(function() { $window.print(); $scope.isPrinting = false; }, 0);
	};

  };
