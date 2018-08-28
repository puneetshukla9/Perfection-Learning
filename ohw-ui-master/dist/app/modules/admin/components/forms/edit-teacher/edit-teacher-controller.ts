'use strict';

export default function(Config, OneRoster, $rootScope, $scope, $stateParams, State, User, Course, School, Localization) {

		var self = this;
		var userId;
		var original;

		$scope.oneRosterLockout = OneRoster.isLockedOut();

		$scope.validation = Config.validation;

		$scope.thisUser = {};
		$scope.canSwitchSchools = false;

		var fldMap = {
			schoolName: 'school_name',
			firstName: 'first',
			lastName: 'last',
			username: 'email',
			password: 'password',
			school_id: 'school_id'
		};

		var payloadMap = {
			firstName: 'first_name',
			lastName: 'last_name'
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
			$scope.schools = _.filter(State.get('schools'), (item) => { return item.treat_as_district === false; });
			userId = $stateParams.id;
			if (!userId) return;
			User.getIndividual(userId).then(function(data) {
				$scope.thisUser = data.user_data;
				original = angular.copy($scope.thisUser);
				$scope.teacher = original;

				//check to see if they have any courses - if they do, disable school picker
				Course.allByUserId(userId).then(function(response){
					if (response.length < 1) {
						$scope.canSwitchSchools = true;

					}
				},
				function(error){
					console.log(error);
				});

			});
		};


		function autoSaveSuccess(name) {
			return function(data) {
				$rootScope.$broadcast('notification confirmation', { sticky: false, message: 'Teacher has been updated.' });
				$scope.updateUser[name].$setPristine();
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
				var val = $scope.updateUser.username.$modelValue;
				return User.editUsername(userId, val);
			},

			password: function() {
				var val = $scope.updateUser.password.$modelValue;
				return User.resetPassword([{'user_id': userId}], val);
			},

			general: function(fld, payloadName) {
				var	editUserPayload = {};
				editUserPayload[payloadName] = $scope.updateUser[fld].$modelValue;
				return User.edit(userId, editUserPayload);
			},

			school: function() {
				var val = $scope.thisUser.school_id;
				return User.assignUserToSchool(userId, val);
			}

		};

		$scope.checkSave = function(name) {
			if (!userId) return;
			var p;
			var origKey = getOrigKey(name);
			var payloadKey = getPayloadKey(name);

			if ($scope.updateUser[name].$modelValue === original[origKey]) {
				$scope.updateUser[name].$setPristine();
			}
			if (!$scope.updateUser[name].$invalid && $scope.updateUser[name].$dirty) {
				$rootScope.$broadcast('wizard save start');

				if (autoSaveMethod[name]) {
					p = autoSaveMethod[name]();
				} else {
					p = autoSaveMethod.general(name, payloadKey);
				}

				p.then(autoSaveSuccess(name), autoSaveFailure);

				//autoSaveMethod[name] && autoSaveMethod[name]() || autoSaveMethod.general(name, payloadKey);
				original = angular.copy($scope.thisUser);
			}
		};

		$scope.checkSaveForSchool = function() {
			if (!userId) return;

			if ($scope.thisUser.school_id === original.school_id) {
				$scope.updateUser.school.$setPristine();
			}

			if (!$scope.updateUser.school.$invalid && $scope.updateUser.school.$dirty) {
				$rootScope.$broadcast('wizard save start');

				var val = $scope.thisUser.school_id;
				User.assignUserToSchool(userId, val).then(
					function(response) {
						$rootScope.$broadcast('wizard save end');
					},
					function(error) {
						var message = Localization.get('api', error.data.status);
						if (message) $rootScope.$broadcast('notification error', { message: message });
					}
				);

				original = angular.copy($scope.thisUser);
			}
		};

		$scope.init();

	};
