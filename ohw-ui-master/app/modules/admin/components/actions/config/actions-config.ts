'use strict';

export default function($q, State, AppState, $state, $stateParams, $location, Student, Course, School, $http,
  ActionsCallbacks) {

  var ActionsConfig = {};

  this.getClasses = function(filterObj, selection) {
    var deferred = $q.defer();
    var classes;

    //if user is district admin, then show classes for the school of the selection
    if (AppState.get('isDistAdmin')) {
        classes = Course.getBySchool(selection[0].school_id, false);
    } else {
        classes = State.get('classes');
    }

    deferred.resolve(classes);
    return deferred.promise;
  };

  this.getSelection = function(filterObj, selection) {
    var deferred = $q.defer();
    deferred.resolve(selection);
    return deferred.promise;
  };

  this.getStudentRegistration = function(filterObj, selection) {
    var deferred = $q.defer();
    var results = [], def = {};
    // selection is rows of classes
    // returns arr of classes
    // depending on which page/table (student roster), not all fields are populated
    if ($state.$current.name === 'classesStudents') {
      Course.getById($stateParams.id).then(function(data) {
        def.name = data.name;
        def.teacher = data.first_name + ' ' + data.last_name;
        def.registration = data.registration_code;
        _.each(selection, function(row, i) {
          results.push({
            name: def.name,
            teacher: def.teacher,
            registration: def.registration
          });
        });
        results = _.uniq(results, 'registration');
        deferred.resolve(results);
      });
    } else {
      _.each(selection, function(row, i) {
        results.push({
          name: row.name,
          teacher: row.first_name + ' ' + row.last_name,
          registration: row.registration_code
        });
      });
      deferred.resolve(results);
    }
    return deferred.promise;
  };

  this.getTeacherRegistration = function(filterObj, selection) {
    // filterObj.school.licenses = [] registration_code, product_id
    var deferred = $q.defer();
    var results = [];
    _.each(selection, function(row, i) {
      results.push({
        name: row.name,
        teacher: row.first_name + ' ' + row.last_name,
        registration: row.registration_code
      });
    });
    deferred.resolve(results);
    return deferred.promise;
  };

  this.sendLicense = function(filterObj, selection) {
    var deferred = $q.defer();
    var results = [];
    deferred.resolve(selection);
    return deferred.promise;
  };

  this.setDistrictSchool = function(filterObj, selection) {
      var deferred = $q.defer();
      deferred.resolve(selection);
      return deferred.promise;
  };

  this.setPLCSchool = function(school_id) {
    var deferred = $q.defer();
    Course.getBySchool(school_id).then((res) => {
      deferred.resolve(res);
    });
    return deferred.promise;
  };

  var self = this;

  ActionsConfig.getConfig = function(id) {
    var record = _.find(ActionsConfig.configMap, { id: id });
    // set default modal if not specified
    if (record && record.modal === undefined) {
      // record.modal = ActionsConfig.defaultModal(id);
    }
    return record;
  };

  ActionsConfig.defaultModal = function(id) {
    return {
      type: 'OKCancel',
      title: 'Test',
      message: 'Test',
      stateName: 'OKCancel',
      data: {}
    };
  };

  ActionsConfig.configMap = [
    { id: 'resetCode',
      feedback: 'Code reset successfully.',
      fetch: self.getSelection,
      modal: {
        type: 'ResetStudentCodes',
        title: 'Reset Student Code',
        message: null,
        stateName: 'resetStudentCodes',
        data: {}
      },
      callback: ActionsCallbacks.resetCode
    },
    { id: 'dropStudentFromClass',
      feedback: 'Student(s) dropped from class.',
      modal: {
        type: 'OKCancel',
        title: 'Are you sure?',
        message: 'Student(s) will be dropped from the class.',
        stateName: 'dropStudentFromClass',
        data: {}
      },
      callback: ActionsCallbacks.dropStudentFromClass
    },
    { id: 'assignClass', feedback: 'Student(s) added to class.',
      fetch: self.getClasses,
      modal: {
        type: 'TransferClass',
        title: 'Add Students to a Class',
        message: 'Add the selected students to the following class:',
        stateName: 'assignClass',
        data: {}
      },
      callback: ActionsCallbacks.assignClass
    },
    { id: 'reclaimLicensesByStudent', feedback: 'Licenses reclaimed from student(s).',
      callback: ActionsCallbacks.reclaimLicensesByStudent,
      modal: {
        type: 'OKCancel',
        title: 'Are you sure you want to reclaim student licenses?',
        message: 'The selected student(s) will be dropped from all courses.',
        stateName: 'reclaimLicensesByStudent',
        data: {}
      }
    },
    { id: 'deleteClass', feedback: 'Class deleted.',
      modal: {
        type: 'OKCancel',
        title: 'Are you sure?',
        message: 'This will delete the class completely.',
        stateName: 'deleteClass',
        data: {}
      },
      callback: ActionsCallbacks.deleteClass },
    { id: 'printTeacherUsername',
      feedback:
	  	'Print, cut, and hand out the usernames and passwords. ' +
		  'You may change all users to the same password to make signing in easier to manage; to do so, click on Reset Password. ' +
	  	'When users log in using the given username and password, they can change their username or password. ',
      fetch: self.getSchoolsById,
      modal: {
        type: 'PrintStudentUsername',
        title: 'Email Template and Print Preview',
        message: null,
        stateName: 'printStudentUsername',
        data: {}
      },
      callback: ActionsCallbacks.printStudentUsername
    },
    { id: 'printStudentUsername',
      fetch: self.getSelection,
      modal: {
        type: 'PrintStudentUsernameSetPassword',
        title: 'Print Student Usernames and Set Codes',
        message: null,
        stateName: 'printStudentUsername',
        data: {}
      },
      callback: ActionsCallbacks.printStudentUsername
    },
    { id: 'deleteStudents',
      modal: {
        type: 'OKCancel',
        title: 'Are you sure?',
        message: 'Student(s) will not be deleted unless they have been dropped from the roster for each course they are in.',
        stateName: 'deleteStudents',
        data: {}
      },
      callback: ActionsCallbacks.deleteStudents
    },
    { id: 'deleteTeachers',
      modal: {
        type: 'OKCancel',
        title: 'Are you sure?',
        message: 'Teacher(s) will not be deleted if they have classes linked to them.',
        stateName: 'deleteTeachers',
        data: {}
      },
      callback: ActionsCallbacks.deleteTeachers
    },
    { id: 'sendStudentLicense',
      fetch: self.sendLicense,
      modal: {
        type: 'OKCancel',
        title: 'Are You Sure?',
        message: 'If usernames and passwords have already been created, you do not need to send the registration codes.',
        stateName: 'sendStudentLicense',
        data: {}
      },
      callback: ActionsCallbacks.sendStudentLicense
    },
    { id: 'sendLicense',
      fetch: self.sendLicense,
      modal: {
        type: 'OKCancel',
        title: 'Are You Sure?',
        message: 'If usernames and passwords have already been created, you do not need to send the registration codes.',
        stateName: 'sendLicense',
        data: {}
      },
      callback: ActionsCallbacks.sendLicense
    },
    { id: 'selectSchool',
      fetch: self.setDistrictSchool,
      callback: ActionsCallbacks.setDistrictSchool
    },
    {
      id: 'plcSelectSchool',
      plc: true,
      fetch: self.setPLCSchool,
      callback: ActionsCallbacks.setPLCSchool
    },
    { id: 'teacherRegistration',
      feedback: '',
      fetch: self.getTeacherRegistration,
      modal: {
        type: 'PrintTeacherRegistration',
        title: 'Teacher Access Information',
        message: null,
        stateName: 'printTeacherRegistration',
        data: {}
      },
      callback: ActionsCallbacks.printTeacherAccessInformation
    }
  ];

  return ActionsConfig;

};
