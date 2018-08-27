'use strict';

export default function($scope, $state) {

    $scope.wizard = {};
    $scope.wizard.tabs = [
      { id: 'teachers',
        name: 'All Teachers',
        state: 'adminApp.teachers.teachersList',
        disabled: false,
        active: true },
      { id: 'update',
        name: 'Teacher Details',
        state: 'adminApp.teachers.editTeacher',
        disabled: true,
        drillOnly: true,
        fullScreen: true,
        require: 'teachers',
        active: false }
      
    ];

  };
