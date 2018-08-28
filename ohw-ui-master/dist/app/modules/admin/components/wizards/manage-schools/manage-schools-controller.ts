'use strict';

export default function($scope, $state) {

    $scope.wizard = {};
    $scope.wizard.tabs = [
    { id: 'licenseList',
      name: 'Manage All Schools',
      state: 'adminApp.schools.schoolsList',
      disabled: true,
      hide: true,
      fullScreen: false,
      active: true }
    ];
  };
