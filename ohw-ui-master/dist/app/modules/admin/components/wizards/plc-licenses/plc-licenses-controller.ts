'use strict';

export default function($scope, $state) {

    $scope.wizard = {};
    $scope.wizard.tabs = [
    { id: 'licenseList',
      name: 'PLC Licenses',
      state: 'adminApp.plcLicenses.licenseList',
      disabled: true,
      hide: true,
      fullScreen: false,
      active: true },
    { id: 'update',
      name: 'PLC License Edit',
      state: 'adminApp.plcLicenses.editLicense',
      disabled: true,
      hide: true,
      fullScreen: true,
      active: false }
    ];
  };
