'use strict';

export default function(State, $cacheFactory) {

		var CourseHelper = {};

		CourseHelper.sorter = function(a, b) {
			var result = 0;
			if (a.name < b.name) {
				result = -1;
			} else if (a.name > b.name) {
				result = 1;
			}
			return result;
		};

		CourseHelper.transformForDistrict = function(data) {
			var originalResponse = angular.copy(data);
			data = data.data;
			if (!(data instanceof Array)) return originalResponse;
			_.each(data, (item) => {
				item.first = item.first_name;
				item.last = item.last_name;
				item.teacher = item.first + ' ' + item.last;
				delete item.first_name;
				delete item.last_name;
			});
			originalResponse.data = data;
			return originalResponse;
		};

		CourseHelper.transform = function(data) {
			var originalResponse = data;
			data = data.data;
			if (!(data instanceof Array)) return originalResponse;
			data = data.sort(CourseHelper.sorter);
			for (var index in data) {
				data[index].teacher = data[index].first + ' ' + data[index].last;
			}
			originalResponse.data = data;
			return originalResponse;
		};

		CourseHelper.clearCache = function(url) {
			var $httpDefaultCache = $cacheFactory.get('$http');
			$httpDefaultCache.remove(url);
		};

		function totalLicenseStudents() {
			var classes = State.get('district_classes');
			var totals = {};
			_.each(classes, (item) => {
				var key = item.book_id;
				if (!totals[key]) { totals[key] = 0; }
				totals[key] += item.student_count;
			});
			State.set('license_students', totals);
		}

		CourseHelper.save = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			// Filter out AMSCO products here, if the filter is needed for all class lists. Otherwise, it will have to be done elsewhere.
			data = _.filter(data, function(item) { return item.product !== 'amsco'; });
			State.set('classes', data);
			totalLicenseStudents();
			return data;
		};

		// Save PLC Admin course data.
		CourseHelper.saveForPLC = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			State.set('district_classes', data);
			State.set('classes', data);
			return data;
		};

		CourseHelper.saveForDistrict = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			//console.log('Litmus Test, Part 1. If you see this first, and the License/School content loads, problem is solved.');
			State.set('district_classes', data);
			State.set('classes', data);
			totalLicenseStudents();
			return data;
		};

		CourseHelper.saveForTeacher = function(user_id) {
			return function(res) {
				var data = _.has(res, 'data') ? res.data : res || [];
				var teacher_data = _.filter(data, (item) => { return parseInt(item.user_id, 10) === user_id; });
				State.set('district_classes', data);
				// List of courses for teacher, unfiltered by product. This is important, since it allows us to use the
				// same list if a different product is selected, without having to requery the server.
				State.set('classes', teacher_data);
				totalLicenseStudents();
				return data;
			};
		};

		CourseHelper.saveClass = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			State.set('class', data);
			return data;
		};

		CourseHelper.saveStudent = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			State.set('studentsClasses', data);
			return data;
		};

		CourseHelper.saveClassesStudent = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			State.set('classesStudents', data);
			return data;
		};

		CourseHelper.saveClassesTeacher = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			State.set('classesTeachers', data);
			return data;
		};

		CourseHelper.saveTeacher = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			//console.log('saving teachers schedule: ', data);
			State.set('teachersSchedule', data);
			return data;
		};

		CourseHelper.saveSchool = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			console.log('saving teachers schedule: ', data);
			State.set('schoolClasses', data);
			return data;
		};

		CourseHelper.saveRoster = function(res) {
			var data = _.has(res, 'data') ? res.data : res || [];
			var roster = data.roster && data.roster[0] && data.roster[0].students || [];
			State.set('roster', roster);
			return data;
		};

		return CourseHelper;

};
