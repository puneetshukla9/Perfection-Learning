'use strict';

export default function(Auth, Student, User, Admin, Teacher, Course, ClassRoster, PubSub,
  	$rootScope, $q, $stateParams, $compile, State, $state, AppState, AdminData, $templateRequest, $timeout, $location) {

  var ActionsCallbacks = {};

  var getNumber = function(num) {
    return new Array(num);
  };

  ActionsCallbacks.assignClass = function($scope, modalScope, filterValue, params, notifications)  {
    // must drop all courses students are in
    // todo: separate out various levels here
    (function() {
      var deferred = $q.defer();
      var courseId = modalScope.selectedClass;
      if (!courseId) return;

      var students = _.map($scope.ctrl.selectedRows, 'user_id');
      var studentCourses = [];

      _.each(students, function(student) {
        studentCourses.push(Student.getAllCourses(student));
      });

      // gets all courses for students
      var getCoursesByStudent = function(res) {
        var coursesByStudent = {};
        _.each(res, function(entry, i) { // student
          var classes = _.map(entry, 'course_id');
          coursesByStudent[students[i]] = classes;
        });
        return coursesByStudent;
      };

      $q.all(studentCourses).then(function(res) {
          // API success returns []
          // Use bulk add instead of looping one-by-one.
          Course.addBulkUsers(courseId, students).then((res) => {
            Auth.get().then(function(res) { // reload course list
              Course.all(); //getBySchool(res.data.school_id, false);
            });
            $rootScope.$broadcast('notification confirmation', { message: notifications.feedback, sticky: false });
          }, (res) => {
            Course.getById(courseId).then(function(res) {
              Auth.get().then(function(res) { // reload course list
                Course.all(); // getBySchool(res.data.school_id, false);
              });
            });
          });
      });
      return deferred.promise;
    })($scope, modalScope, filterValue, params, notifications);
  };

  ActionsCallbacks.deleteClass = function($scope, modalScope, filterValue, params, notifications) {
    var rows = $scope.ctrl.selectedRows;
    var promiseArr = [];
    _.each(rows, function(row, i) {
      promiseArr.push(Course.del(row.course_id));
    });
    $q.all(promiseArr).then(function(res) {
      AppState.refresh(() => {
        //set current course to the first course in the list, to make sure there is a current course always selected
        // AppState.refresh does not itself update curCourse, since curCourse is excluded from its list.
//        AppState.set('curCourse', AppState.get('courses')[0]);
        AppState.set('curCourse', AppState.filteredCourses()[0]);
        // When a class is deleted and the bootstrap data refreshed, send a signal to
        // module-menu-directive for it to refresh the mustAddClass flag. This is because
        // the courses array may now be empty.
        $rootScope.$broadcast('bootstrap refresh');
      });

      $rootScope.$broadcast('notification confirmation', { message: notifications.feedback, sticky: false });
      $scope.ctrl.deleteRows($scope.ctrl.selectedRows);
    });
  };

  ActionsCallbacks.export = function($scope) { $scope.ctrl.exportCSV(); };

  ActionsCallbacks.deleteStudents = function($scope, modalScope, filterValue, params, notifications) {
    var studentIds = _.map($scope.ctrl.selectedRows, 'user_id');
    Student.del(studentIds).then(function(res) {
      $scope.ctrl.deleteRows($scope.ctrl.selectedRows);
      Auth.get().then(function(res) {
        Student.getBySchool(res.data.school_id);
        Course.all(); //.getBySchool(res.data.school_id, false);
        $rootScope.$broadcast('notification confirmation', { message: 'Student(s) successfully deleted.', sticky: false });
      });
    }, function(err) {
      $rootScope.$broadcast('notification error', { message: 'Error deleting student(s).', sticky: false });
    });
  };

  ActionsCallbacks.deleteTeachers = function($scope, modalScope, filterValue, params, notifications) {
    var teacherIds = _.map($scope.ctrl.selectedRows, 'user_id');
    //filter out those teachers selected that have classes
    var promiseArr = [];


   teacherIds.forEach(function(teacherId) {
        promiseArr.push(Course.allByUserId(teacherId));
		});

    $q.all(promiseArr).then(function(result){
      //check the result and make sure to throw out any ids that have more than 0 classes
      result.forEach((theResult, index) => {
        if (theResult.length > 0) {
          teacherIds.splice(index, 1);
        }
      });

      if (teacherIds.length > 0) {
        Teacher.del(teacherIds).then(function(res) {
            $scope.ctrl.deleteRows($scope.ctrl.selectedRows);
            $rootScope.$broadcast('notification confirmation', { message: 'Teacher(s) successfully deleted.', sticky: false });
        }, function(err) {
            $rootScope.$broadcast('notification error', { message: 'Error deleting teacher(s).', sticky: false });
        });
      } else {
          $rootScope.$broadcast('notification error', { message: 'Selected teachers have classes, could not delete.', sticky: false });
      }

    },
    function(error){
      console.log(error);
    });

  };

  ActionsCallbacks.reclaimLicensesByStudent = function($scope, modalScope, filterValue, params, notifications) {
    // student
    var ids = _.map($scope.ctrl.selectedRows, 'user_id');
    var promiseArr = [];
    _.each($scope.ctrl.selectedRows, function(row, i) {
      var allCourses = _.has(row, 'all_courses') ? row.all_courses : [];
      _.each(allCourses, function(course, i) {
        promiseArr.push(Student.removeFromCourse(row.user_id, course));
      });
    });
    $q.all(promiseArr).then(function(res) {
      $rootScope.$broadcast('notification confirmation', { message: notifications.feedback, sticky: false });
      // $scope.ctrl.deleteRows($scope.ctrl.selectedRows);
    });
  };

  ActionsCallbacks.reclaimLicensesBySchool = function($scope, modalScope, filterValue, params, notifications) {
    var teacherIds = _.map($scope.ctrl.selectedRows, 'user_id');
    var promiseArr = [],
      courseList = [],
      usersByCourse = [];
    // 1. get classes by school
    // 2. get list of users for those classes (students, teachers, ta's)
    // 3. drop all from classes
    var schoolIds = _.map($scope.ctrl.selectedRows, 'school_id');
    _.each(schoolIds, function(schoolId, i) {
      promiseArr.push(Course.all); // Course.getBySchool(schoolId));
    });
    $q.all(promiseArr).then(function(res) {
      var promiseArr = [];
      if (res) {
        var allCourses = _.flatten(res);
        // get list of users for courses
        _.each(allCourses, function(course, i) {
          var users;
          var courseId = course.course_id;
          if (courseId) promiseArr.push(Course.getStudentListById(courseId));
        });
        $q.all(promiseArr).then(function(res) {
          var users = res;
          var promiseArr = [];
          if (users) {
            _.each(allCourses, function(course, i) {
              var userIds = _.map(users[i], 'user_id');
              var courseId = course.course_id;
              if (courseId && userIds.length) {
                promiseArr.push(Course.dropUsers(course.course_id, userIds));
              }
            });
            $q.all(promiseArr).then(function(res) {
              $rootScope.$broadcast('notification confirmation', { message: notifications.feedback, sticky: false });
            });
          }
        });
      }
    });
  };

  ActionsCallbacks.resetCode = function($scope, modalScope, filterValue, params, notifications) {
    (function() {
      var password = modalScope.ctrl.password;
      var deferred = $q.defer();
      User.resetCodes($scope.ctrl.selectedRows, password).then(function(res) {
        $rootScope.$broadcast('notification confirmation', { message: notifications.feedback, sticky: false });
        deferred.resolve(res);
        $templateRequest('app/modules/admin/components/dialog/templates/dialogPrintStudentUsername.html').then(function(html) {
          var template = angular.element(html);
          var scope = $rootScope.$new();
          scope.data = modalScope.data;
          var result;
          _.each(scope.data, function(student, i) {
            result = _.find(res, { user_id: student.user_id }).new_password;
            student.password = result;
          });
          var parsedTemplate = $compile(template)(scope);
          // at this point, the template isn't processed yet (digest necessary)
          $timeout(function() {
            var data = parsedTemplate.prop('innerHTML');
            $state.go('adminApp.printPreview', { data: data });
          });
        });

      }, function(err) {
        $rootScope.$broadcast('notification error', { message: 'Unable to set password for user(s).' });
        deferred.reject(err);
      });
      return deferred.promise;
    })($scope, modalScope, filterValue, params, notifications);
	};

  ActionsCallbacks.printTeacherRegistration = function($scope, modalScope) {
    $templateRequest('dialog/templates/dialogPrintTeacherRegistration.html').then(function(html) {
      var template = angular.element(html);
      modalScope.view.isModal = false;
      modalScope.view.isPrint = true;
      var parsedTemplate = $compile(template)(modalScope);
      // at this point, the template isn't processed yet (digest necessary)
      $timeout(function() {
        var data = parsedTemplate.prop('innerHTML');
		$state.go('adminApp.printPreview', { data: data });
      });
    });
  };

  ActionsCallbacks.sendStudentLicense = function($scope, modalScope) {
    var rowCount = $scope.ctrl.selectedRows.length;
    var rows = $scope.ctrl.selectedRows;
    var scope = $rootScope.$new();

    function compileTemplate(scope) {
      $templateRequest('dialog/templates/dialogSendStudentLicense.html').then(function(html) {
        var template = angular.element(html);
        var parsedTemplate = $compile(template)(scope);
        // at this point, the template isn't processed yet (digest necessary)
        $timeout(function() {
          var data = parsedTemplate.prop('innerHTML');
		  $state.go('adminApp.printPreview', { data: data });
        });
      });
    }

    // limit printed data for memory concerns
    scope.data = _.has(rows, 'length') && rows.length > 100 ? rows.slice(0, 100) : rows;
    scope.getNumber = getNumber;
    if ($state.$current.name !== 'classesList') {
      scope.rowCount = 1; // 1 row each
      var classId = $state.params.id;
      var regCode;
      Course.getById(classId).then(function(data) {
        _.each(scope.data, function(row, i) {
          scope.data[i].registration = data.registration_code;
          scope.data[i].teacher = data.first_name + ' ' + data.last_name;
          scope.data[i].name = data.name;
        });
        compileTemplate(scope);
      });
    } else {
      scope.rowCount = 15;
      compileTemplate(scope);
    }
  };

  ActionsCallbacks.printStudentUsername = function($scope, modalScope, filterValue) {
    var userIds = [];
    var collection = $scope.ctrl.selectedRows;
    var password = modalScope.ctrl.password || null;
    User.resetPassword($scope.ctrl.selectedRows, password).then(function(res) {
      $templateRequest('app/modules/admin/components/dialog/templates/dialogPrintStudentUsername.html').then(function(html) {
        var template = angular.element(html);
        var scope = $rootScope.$new();
        scope.data = modalScope.data;
        var result;
        _.each(scope.data, function(student, i) {
          result = _.find(res, { user_id: student.user_id }).new_password;
          student.password = result;
        });
        var parsedTemplate = $compile(template)(scope);
        // at this point, the template isn't processed yet (digest necessary)
        $timeout(function() {
          var data = parsedTemplate.prop('innerHTML');
		  $state.go('adminApp.printPreview', { data: data });
        });
      });
    }, function(err) {
      $rootScope.$broadcast('notification error', { message: 'Unable to set password for user(s).' });
    });
  };

  ActionsCallbacks.dropStudentFromClass = function($scope, modalScope, filterValue, params, notifications) {
    (function() {
      var studentIds = _.map($scope.ctrl.selectedRows, 'user_id');
      var courseId = $stateParams.id; // filterValue.class; // .course_id;
      var promiseArr = [];
      Course.dropUsers(courseId, studentIds).then((res) => {
        $scope.ctrl.deleteRows($scope.ctrl.selectedRows);
        Auth.get().then(function(res) { // reload course list
          $rootScope.$broadcast('wizard save start');
          $timeout(function() {
            Course.all().then((res) => {
              $rootScope.$broadcast('wizard save end');
            });
          }, 100);
        });
        $rootScope.$broadcast('notification confirmation', { message: notifications.feedback });
      });

    })($scope, modalScope, filterValue, params, notifications);
  };

  ActionsCallbacks.dropTeacherFromClass = function($scope, modalScope, filterValue, params, notifications) {
    (function() {
      var teacherIds = _.map($scope.ctrl.selectedRows, 'user_id');
      var courseId = filterValue.class; // .course_id;
      Teacher.removeFromCourse(courseId, teacherIds).then(function(res) {
        $rootScope.$broadcast('notification confirmation', { message: notifications.feedback });
        $scope.ctrl.deleteRows($scope.ctrl.selectedRows);
      });
    })($scope, modalScope, filterValue, params, notifications);
  };

  ActionsCallbacks.sendLicense = function($scope, modalScope) {
    // var regCodes = _.map($scope.ctrl.selectedRows, 'registration_code');
    $templateRequest('dialog/templates/dialogPrintSendLicense.html').then(function(html) {
      var template = angular.element(html);
      modalScope.view.isModal = false;
      modalScope.view.isPrint = true;
      modalScope.getNumber = getNumber;
      var parsedTemplate = $compile(template)(modalScope);
      // at this point, the template isn't processed yet (digest necessary)
      $timeout(function() {
        var data = parsedTemplate.prop('innerHTML');
        $state.go('adminApp.printPreview', { data: data });
      });
    });
  };

  ActionsCallbacks.setDistrictSchool = function($scope, modalScope, filterValue, params) {
      var districtSchools = State.get('district_schools')[0];
      var schools = districtSchools.schools_including_district;
      var filterSchool = _.filter(schools, (school) => { return school.school_id === params; })[0];
      var term = filterSchool && filterSchool.name ? filterSchool.name : '';
      $scope.ctrl.selectedSchool = filterSchool;

  		PubSub.publish('filterTable:dropdownSelect', {
  			term: term
  		});
  };

  ActionsCallbacks.setPLCSchool = function($scope, filterValue, data) {
      var term = filterValue;
      PubSub.publish('filterTable:dropdownSelect', {
        term: term
      });
  };

  return ActionsCallbacks;

};
