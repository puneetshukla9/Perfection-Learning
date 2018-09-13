'use strict';

export default function(Auth, AdminData, User, Calendar, $scope, $rootScope,
	$state, Config, School, Course, Teacher, LicenseHelper, License, Bookshelf, State, AppState, $q, PubSub) {

	var self = this;

	$scope.selected = {};
	$scope.selected.school = '';
	$scope.selected.schoolId = '';
	$scope.selected.teacher = '';
	$scope.selected.license = '';

	$scope.class = {};
	$scope.addClass = {};
	$scope.districtSchoolSelected = false;

	$scope.validation = Config.validation;

	$scope.isDistAdmin = AppState.get('isDistAdmin');
	$scope.isPLCAdmin = AppState.get('isPLCAdmin');

	self.init = function() {
		Auth.get().then(function(res) {
			$scope.selected.userId = res.data.user_id;

			$scope.MYUSEROBJ = {user_id: res.data.user_id, name: res.data.first + ' ' + res.data.last};
			$scope.username = $scope.MYUSEROBJ.name;

			$scope.isTeacher = AppState.get('isTeacher');

			$scope.selected.school = res.data.school_name;
			$scope.selected.schoolId = res.data.school_id;
			$scope.selected.teacher = res.data.user_id;

			var promiseArr = [];
			if (!State.get('schools')) {
				promiseArr.push(School.all);
			}

			if (!State.get('teachers').length) {
				promiseArr.push(User.get()); // Teacher.getBySchool($scope.selected.schoolId));
			}

			var licenses = State.get('licenses');
			if (!licenses || licenses.length === 0) {
				promiseArr.push(License.getAllLicenses({ products: Config.PRODUCTS_FOR_LICENSE }));
			}
			if (promiseArr.length) {
				$q.all(promiseArr).then(function(res) {
					assignState();
				});
			} else {
				assignState();
			}
		});
	};

	$rootScope.$on('initial fetch complete', self.init);

	if (AdminData.hasInitialized()) {
		self.init();
	}

	function assignState() {
		$scope.schools = State.get('schools');
		if (!$scope.isPLCAdmin && $scope.isDistAdmin) {
			var districtSchools = State.get('district_schools');
			$scope.schools = fixDataForSchoolList(districtSchools);
		}
		var districtList = _.filter($scope.schools, (item) => { return item.treat_as_district; });
		$scope.treatAsDistrict = districtList.length > 0;
		$scope.mustSelectSchool = $scope.isDistAdmin && $scope.treatAsDistrict;
		if ($scope.mustSelectSchool) {
			$scope.selected.school = '';
			$scope.selected.schoolId = '';
			$scope.selected.teacher = '';
			$scope.isTeacher = false;
		}

		$scope.teachers = State.get('teachers');
		if ($scope.isDistAdmin && !$scope.treatAsDistrict) {
			$scope.teachers = $scope.teachers.concat(State.get('administrators'));
		}

		var licenses = State.get('licenses');
		$scope.studentLicenses = buildLicenseList(licenses);
	}

	function buildLicenseList(licenses) {
		licenses = _.uniqBy(licenses, 'product_id');
		licenses.sort(LicenseHelper.sort);
		return LicenseHelper.filterStudentData(licenses);
	}

	function fixDataForSchoolList(data) {
		//district_schools comes down with a list of districts with sub-array of schools including district(?)
		var theDistrict = data[0];
		return theDistrict.schools_including_district;
	}

	function fixDataForTeacherList(data) {
		//teachers are not unique from the endpoint - massage this here
		//as not sure if doubling may be required for other consumers of the endpoint
		return _.uniqBy(data, 'name');
	}

	function compileTeacherList(isDistrict) {
		if (isDistrict) {
			var teacherList = State.get('administrators');
		} else {
			teacherList = State.get('teachers');
		}

		return teacherList;
	}

	function getDropdownsBySchoolId(schoolObj) {
		var dropdowns = { teacher: [], license: [] };
		if (schoolObj) {
			if (schoolObj.is_district === true) {
				dropdowns.teacher = State.get('administrators');
			} else {
				if ($scope.isPLCAdmin) {
					Teacher.getBySchool(schoolObj.school_id).then((res) => {
						setNonDistrictTeacherDropdown(State.get('teachers'));
					});
					School.getProductListByID(schoolObj.school_id).then(() => {
						console.log('add-class products for school', schoolObj.school_id, State.get('products'));
						setLicenseDropdown();
					});
				} else {
					var teachers = State.get('teachers');
					dropdowns.teacher = _.filter(teachers, (teacher) => { return teacher.school_id === schoolObj.school_id; });
				}
			}
		}
		return dropdowns;
	}

	$scope.setSchool = function (selected) {
		var selectedSchoolObj = _.find($scope.schools, function(listItem) { return listItem.school_id === selected; });
		if (selectedSchoolObj) {
			$scope.selected.schoolId = selectedSchoolObj.school_id;
			$scope.selected.school = selectedSchoolObj.school;
		} else {
			$scope.selected.schoolId = null;
			$scope.selected.school = '';
		}

		if (selectedSchoolObj && selectedSchoolObj.treat_as_district === true) {
			//set the teacher to the user and disable the field, else, get the teachers from the school
			$scope.selected.teacher = $scope.MYUSEROBJ.user_id;
			$scope.districtSchoolSelected = true;
		} else {
			var dropdowns = getDropdownsBySchoolId(selectedSchoolObj);
//			var teacherDropdown = getTeachersBySchoolId(selectedSchoolObj);
			setNonDistrictTeacherDropdown(dropdowns.teachers);
		}
	};

	function setNonDistrictTeacherDropdown(teacherDropdown) {
		$scope.teachers = fixDataForTeacherList(teacherDropdown);
		$scope.districtSchoolSelected = false;
	}

	function setLicenseDropdown() {
		var products = _.map(State.get('products'), (item) => {
			return { license: item.license, product_id: +item.product_id };
		});
		$scope.studentLicenses = buildLicenseList(products);
	}

	// When a course is created, the associated book isn't automatically added.
	// This is called once the Course.create call completes and returns the new
	// courseId.
	function addBookToCourse(courseCreatePayload) {
		var courseId = courseCreatePayload;
		var bookId = parseInt($scope.selected.license, 10);
		var books = [bookId];
		return Bookshelf.addToCourse(courseId, books);
	}

	$scope.create = function() {
		if ($scope.isPLCAdmin) {
			$scope.selected.schoolId = $scope.dropdown_school_id;
		}
		var payload = {
			book_id: parseInt($scope.selected.license, 10),
			school_id: parseInt($scope.selected.schoolId, 10),
			num: $scope.class.number,
			name: $scope.class.name,
			start_date: $scope.class.startDate,
			end_date: $scope.class.endDate,
			user_id: parseInt($scope.selected.teacher, 10)
		};

		Course.create(payload).then(function(data) {
			// Add book to course for bookshelf display.
			addBookToCourse(data);
			AppState.refresh(() => {
				// Once class is created, broadcast to module-menu-directive, so it can update course list.
				// This keeps mustAddClass flag up-to-date.
				Course.all().then(function() {
					$rootScope.$broadcast('bootstrap refresh');
					$rootScope.$broadcast('update product', { productId: payload.book_id });
					$rootScope.$broadcast('notification confirmation', { message: 'Class created successfully.', sticky: false });
					PubSub.publish('tableDataChanged');
					$state.go('adminApp.classes.classesList');
				});
			});
		});
	};


	function plcSetSchool(obj, data) {
		console.log('add-class plcSetSchool', data.dropdown_school_id);
		$scope.setSchool(data.dropdown_school_id);
	}

	self.calendar = Calendar;
	$rootScope.$on('plc:schooldropdown', plcSetSchool);

};
