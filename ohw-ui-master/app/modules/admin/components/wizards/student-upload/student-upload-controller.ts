'use strict';

export default function($scope, $state) {

    $scope.wizard = {};
    $scope.wizard.tabs = [
      { id: 'instructions',
        name: 'Instructions',
        state: 'adminApp.studentUpload.uploadInstructions',
        fullScreen: true,
        disabled: false,
        active: true },
      // { id: 'usernames',
      //   name: 'Changes',
      //   state: 'adminApp.studentUpload.uploadConfirm',
      //   disabled: true,
      //   fullScreen: true,
      //   active: false
      // },
      { id: 'upload',
        name: 'View Students',
        state: 'adminApp.studentUpload.uploadTable',
        disabled: true,
        drillOnly: true,
        fullScreen: true,
        require: 'students',
        active: false }
    ];

};
