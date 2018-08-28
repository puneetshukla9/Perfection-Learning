'use strict';

export default function(Config, OneRoster, $rootScope, $scope, $stateParams, $state, State, User) {

		var self = this;
		var userId;
		var original;

		$scope.oneRosterLockout = OneRoster.isLockedOut();

		$scope.validation = Config.validation;

		$scope.student = {};

		var fldMap = {
			schoolName: 'school_name',
			firstName: 'first',
			lastName: 'last',
			studentNumber: 'student_num',
			username: 'email',
			password: 'password'
		};

		var payloadMap = {
			firstName: 'first_name',
			lastName: 'last_name',
			studentNumber: 'student_num'
		};

		var getOrigKey = function(name) {
			var origKey;
			origKey = fldMap[name];

			return origKey;
		};

		var getPayloadKey = function(name) {
			return payloadMap[name];
		};


		$scope.init = function() {
			$scope.showPassword = false;
			$scope.schools = State.get('schools');
			userId = $stateParams.id;
			if (!userId) return;
			User.getIndividual(userId).then(function(data) {
				$scope.student = data.user_data;
				$scope.userCourses = data.courses;
				$scope.student.licenses = data.licenses;
				$scope.student.courses = data.courses;
				original = angular.copy($scope.student);
			});
		};


		function autoSaveSuccess(name) {
			return function(data) {
				$rootScope.$broadcast('notification confirmation', { sticky: false, message: 'Student has been updated.' });
				$scope.updateStudent[name].$setPristine();
				$rootScope.$broadcast('wizard save end');
			};
		}


		function autoSaveFailure(err) {
			$rootScope.$broadcast('wizard save end');
			$scope.init();
			$rootScope.$broadcast('notification error', { message: 'We had a problem updating the user.' });
		}

		// Table of autosave methods, since we can't use the same REST call for each field,
		// and some fields require special handling.
		var autoSaveMethod = {

			username: function() {
				var val = $scope.updateStudent.username.$modelValue;
				return User.editUsername(userId, val);
			},

			password: function() {
				var val = $scope.updateStudent.password.$modelValue;
				return User.resetPassword([{'user_id': userId}], val);
			},

			studentNumber: function() {
				var editUserPayload = {
					student_num: {
						school_id: parseInt($scope.student.school_id, 10),
						student_num: $scope.updateStudent.studentNumber.$modelValue
					}
				};
				return User.edit(userId, editUserPayload);
			},

			general: function(fld, payloadName) {
				var	editUserPayload = {};
				editUserPayload[payloadName] = $scope.updateStudent[fld].$modelValue;
				return User.edit(userId, editUserPayload);
			}

		};

		$scope.checkSave = function(name) {
			if (!userId) return;
			var p;
			var origKey = getOrigKey(name);
			var payloadKey = getPayloadKey(name);
			if ($scope.updateStudent[name].$modelValue === original[origKey]) {
				$scope.updateStudent[name].$setPristine();
			}
			if (!$scope.updateStudent[name].$invalid && $scope.updateStudent[name].$dirty) {
				$rootScope.$broadcast('wizard save start');

				if (autoSaveMethod[name]) {
					p = autoSaveMethod[name]();
				} else {
					p = autoSaveMethod.general(name, payloadKey);
				}

				p.then(autoSaveSuccess(name), autoSaveFailure);

				//autoSaveMethod[name] && autoSaveMethod[name]() || autoSaveMethod.general(name, payloadKey);
				original = angular.copy($scope.student);
			}
		};

		$scope.linkToClass = function(id) {
			$state.go('adminApp.classes.editClass', { id: id });
		};

		$scope.init();

	};
