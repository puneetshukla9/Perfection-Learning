'use strict';

export default function($scope, $state) {

    $scope.wizard = {};
    $scope.wizard.tabs = [
      { id: 'students',
        name: 'All Students',
        state: 'adminApp.students.studentsList',
        disabled: false,
        active: true },
      { id: 'update',
        name: 'Student Details',
        state: 'adminApp.students.editStudent',
        disabled: true,
        drillOnly: true,
        fullScreen: true,
        require: 'students',
        active: false }
      //   ,
      // { id: 'roster',
      //   name: 'Select Students',
      //   state: 'selectExisting',
      //   disabled: false,
      //   fullScreen: true,
      //   static: true, // cannot disable
      //   active: false }
    ];

  };
