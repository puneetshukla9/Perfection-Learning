'use strict';

export default function(Config, Auth, Localization, $stateParams, $state, $scope,
		$q, $rootScope, $timeout, Course, School, User, License, UserValidation, State, AppState, TeacherHelper) {

	$scope.validation = Config.validation;
	$scope.isDistAdmin = false;

	$scope.map = {
		student: 'student',
		teacher: 'teacher',
		admin: 'administrator'
	};

	$scope.placeholderMap = {
		student: 'e.g., student@school.edu, or a non-email username',
		teacher: 'e.g., teacher@school.edu',
		admin: 'e.g., admin@district.edu'
	};

	$scope.instructionMap = {
		student: 'Usernames can either be a valid e-mail address, or a non-email address with a set of characters like "student1" or "student2".',
		teacher: 'Usernames must be a valid e-mail address as an email to set up password will be sent when added.',
		admin: 'Usernames must be a valid e-mail address as an email to set up password will be sent when added.'
	};

	$scope.aproposPattern = Config.validation.student_username.regex;
	$scope.mustSelectSchool = true;

	$scope.placeholderText = '';

	$scope.user = {};
	$scope.user.level = 'student'; // can use $stateParams later: student / teacher / admin
	if ($state.$current.name.includes('Teacher')) {
		$scope.user.level = 'teacher';
	}

	$scope.user.type = $scope.map[$scope.user.level];

	$scope.newUser = {};
	$scope.newUser.school = '';
	$scope.newUser.adminType = '';

	$scope.adminTypes = [
		{ id: '4', name: 'School Administrator' },
	  	{ id: '5', name: 'District Administrator' }
	];

	// how to ensure this data is present?
	$scope.init = function() {
		$scope.showPassword = true;
		$scope.isPLCAdmin = AppState.get('isPLCAdmin');
		$scope.isDistAdmin = AppState.get('isDistAdmin');
		Auth.get().then(function(res) {
			var promiseArr = [School.getforCurrentUser()];
			$q.all(promiseArr).then(function(data) {
				$scope.newUser.school = data[0][0];
				$scope.newUser.adminType = $scope.adminTypes[0];
				$scope.placeholderText = $scope.placeholderMap[$scope.user.type];
				$scope.instructionText = $scope.instructionMap[$scope.user.type];

				if ($scope.user.level !== 'student') {
					$scope.aproposPattern = Config.validation.email.regex;
				}
			});

			Course.all(AppState).then(() => {
				School.all(AppState).then(() => {
					var districtList = _.filter(State.get('schools'), (item) => { return item.treat_as_district; });
					var treatAsDistrict = districtList.length > 0;
					if ($scope.isPLCAdmin) {
						$scope.schools = State.get('schools');
					} else {
						$scope.schools = _.filter(State.get('schools'), (school) => { return school.treat_as_district === false; });
					}
					$scope.isDistAdmin = $scope.isDistAdmin && treatAsDistrict;
					$scope.mustSelectSchool = ($scope.isDistAdmin && treatAsDistrict) || ($scope.user.level === 'teacher' && ($scope.schools.length > 1));
					if (!$scope.mustSelectSchool) {
						$scope.newUser.school_id = $scope.schools[0].school_id;
					}
				});
			});

		});

	};

	$scope.init();

	$scope.formatLabel = function(model, modelKey, displayKey) {
		var config = {};
		config[modelKey] = model;
	  var result = _.find($scope.schools, config);
	  if (result) {
	    return result[displayKey];
	  } else {
	    return '';
	  }
	};

	$scope.createPayload = function() {
		var tempPass = 'ChangeM3';
		var payload = {};
		if ($scope.isPLCAdmin) {
			payload.school_id = $scope.dropdown_school_id;
		} else if ($scope.isDistAdmin) {
			payload.school_id = $scope.newUser.school_id;
		} else {
			payload.school_id = parseInt($scope.newUser.school.school_id, 10);
		}

		if ($scope.user.level === 'student') {
			payload.usertype = 1;
			// todo: need to handle studentNumber
			_.extend(payload, {
				first_name: $scope.newUser.firstName,
				last_name: $scope.newUser.lastName,
				email: $scope.newUser.email,
				student_num: $scope.newUser.studentNumber //username,
			});
		} else if ($scope.user.level === 'teacher') {
			payload.usertype = 2;

			_.extend(payload, {
				first: $scope.newUser.firstName,
				last: $scope.newUser.lastName,
				email: $scope.newUser.email,
				password: TeacherHelper.genPwd(),
				token: ''
			});

			var schoolPicked = _.find($scope.schools, (thisSchool) => {
				return thisSchool.school_id === $scope.newUser.school_id;
			});

			if (schoolPicked && schoolPicked.registration_code) {
				payload.token = schoolPicked.registration_code;
			}

		} else { // admin
			payload.usertype = $scope.newUser.adminType;
		}

		return payload;
	};

	var view = {};
	$scope.view = view;

	$scope.create = function() {
		var payload = $scope.createPayload();
		var successMsg = 'A ' + $scope.user.type + ' has been added.';

		if (!payload.email.length) return;

		User.create(payload).then(function() {

			$scope.newUser.firstName = '';
			$scope.newUser.lastName = '';
			$scope.newUser.email = '';
			$scope.newUser.username = '';
			$scope.newUser.password = '';
			$scope.newUser.studentNumber = '';
			$scope.addUser.$setPristine();
			$scope.addUser.$setUntouched();

			var returnState = 'adminApp.' + $scope.user.level + 's.' + $scope.user.level + 'sList';

			if ($scope.user.level === 'teacher') {

				payload.pw = payload.password;

				User.registerWithCode(payload).then(function(resp){
					User.sendPwEmail(payload.email).then(function() {
						successMsg = 'This user has been created and an email sent to set password.';
						$rootScope.$broadcast('notification confirmation', { sticky: false, message: successMsg});
						$state.go(returnState);
						},
						function(error) {
							console.log(error);
						});
				},
				function(error){
					console.log(error);
				});

			} else {
				$rootScope.$broadcast('notification confirmation', { sticky: false, message: successMsg});
				$state.go(returnState);
			}
		}, function(err) {
			var message = Localization.get('api', err.data.status);
			if (err.data.status === 'USERNAME_TAKEN') {
				$scope.newUser.email = '';
			} else if (err.data.status === 'STUDENT_NUM_TAKEN') {
				$scope.newUser.studentNumber = '';
			}
			if (message) $rootScope.$broadcast('notification error', { message: message });
			$scope.init();
		});
	};

	var handle;

	// todo: move to a service for re-use

	$scope.blur = {};

	$scope.setBlur = function(input, state) {
		$scope.blur[input] = state;
	};

	$scope.hasBlurred = function() {
		return !!$scope.blur.firstName && !!$scope.blur.lastName;
	};

	$scope.$watchGroup(['newUser.firstName', 'newUser.lastName', 'hasBlurred()'], function(n, o) {
		// test for focus to make sure user still not entering data
		var namesCompleted = (!!$scope.newUser.firstName && !!$scope.newUser.lastName);
		var emailBlank = !!!$scope.newUser.email;
		if (n[2] && namesCompleted && emailBlank && $scope.user.level !== 'teacher') {
			$scope.newUser.email = (($scope.newUser.firstName || '') + ($scope.newUser.lastName || '')).toLowerCase();
		}
	});

};
