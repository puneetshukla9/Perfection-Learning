'use strict';

var template = require('./class-menu.html');
var config = require('./../../../config/application-config.json')['class-menu'];

export default function($q, AppState, Course, CourseHelper, $rootScope, State, PubSub, $timeout) {

		var setCourse = function(course) {
			var deferred = $q.defer();
			if (!course || !_.has(course, 'id')) {
				deferred.reject(course);
			} else {
				Course.setById(course.id).then((res) => {
					var result = _.extend(course, res);
					AppState.set('curCourse', result);
					$rootScope.$broadcast('class change', result);
					deferred.resolve(result);
				});
			}
			return deferred.promise;
		};

		var getDefaultCourse = function(courses) {
			if (!courses || !_.has(courses, 'length')) return false;
			return courses[0];
		};

		var buildClassList = function(classes, userId) {
			return _.reduce(classes, (courses, entry) => {
				if (parseInt(entry.user_id, 10) === userId) {
					courses.push({ id: entry.course_id, name: entry.name, product: entry.product });
				}
				return courses;
			}, []).sort(CourseHelper.sorter);
		};

		return {
			restrict: 'A',
			scope: true,
			templateUrl: template,
			replace: true,
			link: function(scope, elem, attrs) {
				scope.visible = true;
//				scope.courses = scope.courses || AppState.get('courses').sort(CourseHelper.sorter);
				scope.courses = scope.courses || AppState.filteredCourses().sort(CourseHelper.sorter);
//				scope.curCourse = scope.curCourse || getDefaultCourse(scope.courses);
				scope.curCourse = AppState.get('curCourse') || getDefaultCourse(scope.courses);
				scope.assignmentdetails = attrs.details ? true : false;

				var userId = AppState.get('user_id');
				var loaded = loaded || false;

				// initial course set
				if (!loaded) {
					setCourse(scope.curCourse).then((course) => {
						scope.curCourse = course;
						loaded = true;
					}, () => {
						//scope.visible = false;
					});
				}

				// changed from menu
				scope.handleClassChange = () => {
					var course = scope.curCourse;
					setCourse(course).then((course) => {
						scope.curCourse = course;
					}, () => {
						//scope.visible = false;
					});
				};

				$rootScope.$on('module change', (e, name, state) => {
					scope.visible = config[name];
				});

				// dump this as soon as possible
				PubSub.subscribe('StateChange:classes', function(classes) {
					// This subscription is to 'StateChange' + key in state-factory. It is not specific
					// to classes but broadcasts whenever a State.set() call is made.

					// The classes list received here is unfiltered. If this is processed AFTER
					// AppState.filteredCourses() is called, the result will be an unfiltered list.
					// For this reason, it's necessary to ensure that filtering is performed at this stage.
					// Note, too, that the classes parameter is passed to the filter. This is to ensure
					// that the current class list is used as the bases for what the filter returns.
					// While the AppState.data.courses array will be updated with the same class list,
					// that is handled by another subscriber to 'StateChange:classes' and therefore can't
					// be guaranteed to take place before this call to filteredCourses. It therefore can't
					// be assumed that the AppState.data.courses array has already been updated.
					// The AppState.filteredCourses() function used to not take a parameter but was modified
					// specifically to allow the courses to be filtered to be specified as a parameter. It
					// still uses AppState.data.courses as a default.
					var filteredClasses = AppState.filteredCourses(classes);
					scope.courses = buildClassList(filteredClasses, userId);
					if (!scope.curCourse || _.isEmpty(scope.curCourse)) {
						var defaultCourse = getDefaultCourse(scope.courses);
						if (defaultCourse) {
							setCourse(defaultCourse).then((course) => { scope.curCourse = course; });
						}
					}
				});

			}
		};

	};
