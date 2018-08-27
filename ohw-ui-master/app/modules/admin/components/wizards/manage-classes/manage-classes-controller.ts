'use strict';

export default function($scope, $state, AppState) {
    var digitalBooks = AppState.setDigitalBooks();

    $scope.wizard = {};
    var tabs = [
      { id: 'classes',
        name: 'All Classes',
        state: 'adminApp.classes.classesList',
        disabled: false,
        active: true },
      { id: 'update',
        name: 'Class Details',
        state: 'adminApp.classes.editClass',
        disabled: true,
        require: 'classes',
        fullScreen: true,
        active: false },
      { id: 'bookshelf',
        name: 'Bookshelf',
        state: 'adminApp.classes.bookshelf',
        disabled: true,
        require: 'classes',
        fullScreen: true,
        active: false
      },
      { id: 'roster',
        name: 'Class Roster',
        state: 'adminApp.classes.classesStudents',
        disabled: true,
        require: 'update',
        fullScreen: true,
        active: false }
    ];

    configureTabs();

    function configureTabs() {
      tabs.forEach(t => {
        // Omit Bookshelf tab if Digital Books flag is false.
        if (!digitalBooks && t.id === 'bookshelf') {
          t.hide = true;
        }
      });
      $scope.wizard.tabs = tabs;
    }
  };
