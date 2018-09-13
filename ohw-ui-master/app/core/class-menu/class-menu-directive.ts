'use strict';

var template = require('./class-menu.html');
var config = require('./../../../config/application-config.json')['class-menu'];

export default function($q, AppState, Preferences, Course, CourseHelper, $rootScope, State, PubSub, $timeout) {
		var filteredCoursesDeregister;

		var setCourse = function(course) {
			var deferred = $q.defer();
			if (!course || !_.has(course, 'id')) {
				deferred.reject(course);
			} else if (AppState.get('CourseFilterActive')) {
				// AppState CourseFilterActive is set by app-state-factory.ts when the course filter is set for the current product.
				Course.setById(course.id).then((res) => {
					var result = _.extend(course, res);
					AppState.set('curCourse', result);
					$rootScope.$broadcast('class change', result);
					// When a course is set, update the curCourse Preference for the user.
					// This allows the course selection to be recalled on page reload. This is important for
					// restoring the course selection after using Student view from the Assignment List.
					Preferences.set('curCourse', result);
					deferred.resolve(result);
				});
			}
			return deferred.promise;
		};

		var getDefaultCourse = function(courses) {
			if (!courses || !_.has(courses, 'length')) return false;
			// When getting the default course, first check for a curCourse setting.
			// If curCourse is present, choose the course from the params courses array by
			// matching course.id.
			// If curCourse is not present, or is 0, null, or otherwise false, use the first
			// element from the courses array.
			let defaultCourse;
			if (AppState.get('curCourse')) {
				defaultCourse = courses.find(course => { return course.id === AppState.get('curCourse').id; });
			} else {
				defaultCourse = courses[0];
			}

			return defaultCourse;
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
				//var loaded;
				scope.visible = true;
				scope.courses = scope.courses || AppState.filteredCourses().sort(CourseHelper.sorter);
				scope.curCourse = AppState.get('curCourse') || getDefaultCourse(scope.courses);
				scope.assignmentdetails = attrs.details ? true : false;

				var userId = AppState.get('user_id');
				//loaded = loaded || false;
				// The filteredCourseTriggered flag is set when asynchronous setCourse returns within the
				// 'filtered courses' handler. This is to signal setCourse not to overwrite the result if
				// it later returns from just the !loaded condition.
				// This is SO not a good approach.
				var filteredCourseTriggered = false;

				// initial course set
				//if (!loaded) {
				setCourse(scope.curCourse).then((course) => {
					if (!filteredCourseTriggered) {
						scope.curCourse = course;
				//			loaded = true;
					} else {
						// filteredCourseTriggered is already set, which means we're here because of a race condition.
						// This means setCourse was called with the original course, not with the one used after filtering.
						// This means that the wrong course may have been used for setting the assignment list. That needs
						// to be corrected: call setCourse again, with the curCourse value used for the filtered courses call.
						// And there really HAS to be a better way to do this. FIX!
						console.log('race; setting course *again*, with correct course', scope.curCourse);
						setCourse(scope.curCourse);
					}
				});
				//}

				// Trigger filtered courses when the filteredCourses function has run from subject-dropdown-directive.
				// This causes the course dropdown to be synched with the product dropdown when the page is reloaded
				// and when the user returns from Student view.
				//
				// First, make sure to deregister any existing handler.
				if (filteredCoursesDeregister) {
					filteredCoursesDeregister(); // zombie decapitation
				}
				filteredCoursesDeregister = $rootScope.$on('filtered courses', function() {
					scope.courses = AppState.filteredCourses().sort(CourseHelper.sorter);
					scope.curCourse = getDefaultCourse(scope.courses);

					// initial course set
					//if (!loaded) {
					setCourse(scope.curCourse).then((course) => {
						scope.curCourse = course;
					//		loaded = true;
							// Set filteredCourseTriggered flag to prevent scope.curCourse from being overwritten if
							// the above setCourse call returns later.
							// This is a seriously convoluted approach, and we HAVE to come up with something better.
						filteredCourseTriggered = true;
					});
					//}
				});

				// changed from menu
				scope.handleClassChange = () => {
					var course = scope.curCourse;
					setCourse(course).then((course) => {
						scope.curCourse = course;
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
