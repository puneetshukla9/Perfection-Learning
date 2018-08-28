'use strict';

export default function($http, $q, Config, CourseHelper, API) {

		var Course = {};

		Course.getManual = function(productId, partId) {
			var url = API.BASE + 'info/manual/' + productId + '/part/' + partId;
			return $http.get(url, { responseType: 'arraybuffer' });
		};

		Course.setById = function(id) {
			var url = API.BASE + 'courses/select/' + id;
			return $http.put(url, {id: id, get_roster: true, verbose: true}).then(CourseHelper.saveRoster);
			// verbose: true to include students
			// (for now; presumably get_roster will take care of this eventually)
		};

		Course.getById = function(id) {
			var url = API.BASE + 'admin/course/' + id;
			return $http.get(url, {cache: false}).then(CourseHelper.saveClass);
		};

		Course.getRosterById = function(id) {
			var url = API.BASE + 'students/course/' + id;
			return $http.get(url);
		};

		Course.getGradebook = function(id, payload) {
			var url = API.REST_BASE + 'grades/' + id + '/filtered';
			return $http.put(url, payload, { cache: false });
		};

		Course.getStudentListById = function(id) { // this returns students: no transformer needed (should move to students)
			return $http.get(API.BASE + 'admin/students/course/' + id, { cache: false }).then(CourseHelper.saveClassesStudent);
		};

		Course.getTeacherListById = function(teacherId) {
			return $http.get(API.BASE + 'admin/course/' + teacherId + '/instructors', {
				transformResponse: API.appendTransform(CourseHelper.transform) }).then(CourseHelper.saveClassesTeacher);
		};

		Course.allByUserId = function(userId) {
			var url = API.BASE + '/admin/user/' + userId + '/courses/all';
			return $http.get(url, {
				transformResponse: API.appendTransform(CourseHelper.transform) }).then(CourseHelper.saveTeacher);
		};

		Course.allByStudentId = function(studentId) {
			var url = API.BASE + '/admin/user/' + studentId + '/courses/all';
			return $http.get(url, {
				transformResponse: API.appendTransform(CourseHelper.transform) }).then(CourseHelper.saveStudent);
		};

		Course.getBySchoolRoster = function(schoolId) {
			var url = API.BASE + 'admin/school/courses/all/school/' + schoolId;
			return $http.get(url, {
				transformResponse: API.appendTransform(CourseHelper.transform) }).then(CourseHelper.saveSchool);
		};

		Course.getBySchool = function(schoolId, cache) {
			var url = API.BASE + 'admin/school/courses/all/school/' + schoolId;
			return $http.get(url, {
				transformResponse: API.appendTransform(CourseHelper.transform), cache: cache }).then(CourseHelper.save);
		};

		// This is called when the courses need to be updated. It will now call either for teacher or for district, depending on who's logged in.
		Course.all = function(appState) {
			var promise;
			var isPLCAdmin;
			var isDistAdmin;
			if (appState && appState.get) {
				isPLCAdmin = appState.get('isPLCAdmin');
				isDistAdmin = appState.get('isDistAdmin');
			}
			if (isPLCAdmin) {
				promise = Course.getForPLC();
			} else if (isDistAdmin) {
				promise = Course.getForDistrict();
			} else {
				promise = Course.getForTeacher();
			}
			return promise;
		};

		// For now, getForPLC will just resolve to an empty array.
		// Use new CourseHelper.saveForPLC to initialize classes and district_classes states.
		// If needed, change to use CourseHelper.saveForDistrict or saveForTeacher, or whatever.
		Course.getForPLC = function() {
			var p = new Promise((resolve, reject) => {
				resolve(CourseHelper.saveForPLC({data: []}));
			});
			return p;
		};

		Course.getForDistrict = function() {
			var url = API.BASE + 'admin/district/courses/all';
			return $http.get(url, {
				cache: false,
				transformResponse: API.appendTransform(CourseHelper.transformForDistrict)
			}).then(CourseHelper.saveForDistrict);
		};

		// Renamed this from Course.all. This is what used to be called whenever the courses needed to be updated.
		Course.getForTeacher = function() {
			var user_id = window.ohw.appConfig.user_id;
			var url = API.BASE + 'admin/district/courses/all';
			return $http.get(url, {
				cache: false,
				transformResponse: API.appendTransform(CourseHelper.transformForDistrict)
			}).then(CourseHelper.saveForTeacher(user_id));
		};


		Course.dropUsers = function(courseId, userIds) {
			var url = API.BASE + '	admin/users/drop/course/' + courseId + '/bulk';
			return $http.put(url, userIds).then(CourseHelper.save);
		};

		Course.del = function(id) {
			var url = API.BASE + 'admin/course/' + id + '/delete';
			return $http.delete(url).then(CourseHelper.save).then(Course.all);
		};

		Course.create = function(payload) {
			var permissions = window.ohw.appConfig.permissions;
			var url = API.BASE + 'admin/course/create';
			return $http.post(url, payload); //.then(Course.all).then(Course.all);
		};

		Course.update = function(courseId, payload) {
			var url = API.BASE + 'admin/course/' + courseId + '/modify';
			return $http.put(url, payload).then(Course.all);
		};

		Course.addBulkUsers = function(courseId, userIds) {
			var payload = [];
			userIds.forEach((id) => {
				payload.push({ user_id: parseInt(id, 10) });
			});
			var url = API.BASE + 'admin/users/course/' + courseId + '/bulk';
			return $http.put(url, payload);
		};

		return Course;

	};
