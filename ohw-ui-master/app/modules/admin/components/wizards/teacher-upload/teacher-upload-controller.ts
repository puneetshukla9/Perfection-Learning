'use strict';

export default function($scope, $state) {

    $scope.wizard = {};
    $scope.wizard.tabs = [
      { id: 'instructions',
        name: 'Instructions',
        state: 'adminApp.teacherUpload.uploadInstructions',
        fullScreen: true,
        disabled: false,
        active: true },
      { id: 'upload',
        name: 'View Teachers',
        state: 'adminApp.teacherUpload.uploadTable',
        disabled: true,
        drillOnly: true,
        fullScreen: true,
        require: 'students',
        active: false }
    ];

};
