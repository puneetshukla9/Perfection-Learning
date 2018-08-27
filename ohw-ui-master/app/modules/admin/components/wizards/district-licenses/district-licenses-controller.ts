'use strict';

export default function($scope, $state) {

    $scope.wizard = {};
    $scope.wizard.tabs = [
    { id: 'licenseList',
      name: 'District Licenses',
      state: 'adminApp.licenses.licenseList',
      disabled: true,
      hide: true,
      fullScreen: false,
      active: true },
    { id: 'update',
      name: 'District License Schools',
      state: 'adminApp.licenses.districtLicenseList',
      disabled: true,
      hide: true,
      fullScreen: true,
      active: false }
    ];
  };
