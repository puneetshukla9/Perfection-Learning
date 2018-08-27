'use strict';

import * as moment from 'moment';

export default function($scope, $stateParams, Calendar, $rootScope, OneRoster,
		Auth, Config, State, School, Course, Teacher, License, PubSub, $timeout, $location, User, $q, SchoolHelper) {

		var self = this;
		$scope.oneRosterLockout = OneRoster.isLockedOut();

		var courseId;
		$scope.selected = {};
		$scope.selected.school = '';
		$scope.selected.teacher = '';
		$scope.selected.license = '';
		self.distrCourse = false;

		$scope.validation = Config.validation;

		$scope.course = {};
		$scope.addClass = {};

		var schoolId;

		self.getClass = function() {
			Course.getById($stateParams.id).then(function(data) {
				courseId = data.course_id;
				//$scope.course = State.get('class');
				$scope.course = data;
				$scope.course.teacher = $scope.course.first_name + ' ' + $scope.course.last_name;
			});
		};

		self.init = function() {
			if (!$stateParams.id) return $rootScope.$broadcast('notification error', { message: 'No class specified for update' });
			self.getClass();
			Auth.get().then(function(res) {
				schoolId = res.data.school_id;
				Course.getById($stateParams.id).then(function(data) {
					courseId = data.course_id;
					data.start_date = data.start_date ? moment(data.start_date)._d : null;
					data.end_date = data.end_date ? moment(data.end_date)._d : null;
					$scope.course = data;
					$scope.course.teacher = $scope.course.first_name + ' ' + $scope.course.last_name;
					self.distrCourse = SchoolHelper.isDistrictSchool($scope.course.school_id);
					//var forTeacher = Teacher.getBySchool; // Teacher.getBySchool(schoolId)
					$q.all([School.all(), User.get(), License.getAllLicenses({ products: Config.PRODUCTS_FOR_LICENSE })]).then(function(res) {
						$scope.schools = State.get('schools');
						$scope.teachers = State.get('teachers');
						$scope.licenses = _.uniq(State.get('licenses'), 'license');
						$scope.studentLicensesUnique = State.get('studentLicensesUnique');
					});
				});
			});
		};

		self.checkSave = function(name) {
			// The intent here was to set the field $invalid so it would show with a red label and field outline.
			//if ($scope.course[name] === null) $scope.updateClass[name].$setValidity(name, false); // if value is null, don't save.
			if ($scope.course[name] !== null && !$scope.updateClass[name].$invalid && $scope.updateClass[name].$dirty) {
				autoSave(name);
			}
		};

		function autoSave(name) {
			var editCoursePayload = {};
			var val = $scope.course[name];
			editCoursePayload[name] = val;
			if (_.isEmpty(editCoursePayload)) return;
			$rootScope.$broadcast('wizard save start');
			Course.update(courseId, editCoursePayload).then(function(data) {
				$rootScope.$broadcast('wizard save end');
				$scope.updateClass[name].$setPristine();
			});
		}

		function updateDate(fld) {
			if ($scope.course.end_date && $scope.course.start_date > $scope.course.end_date) {
				$scope.course.start_date = $scope.course.end_date;
			}
			autoSave(fld);
		}

		self.updateDate = updateDate;
		self.calendar = Calendar;

		self.init();
};
