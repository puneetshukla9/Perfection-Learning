'use strict';

var template = require('./product-menu.html');
/*
  Menu options are assigned to configurations. Each configuration is given a switch, so that configurations can be combined.
  Configuration    Switch   Description
  Configuration 1  1        Language Arts
  Configuration 2  2        MathX
  Configuration 3  4        Reading Essentials (Kitaboo, IHDP)
  Configuration 4  8        Handwriting
  Configuration 5  16       FPP National
  Configuration 6  32       AMSCO

	Always On        1024     Options that should always be available, such as Logout
*/
var menuOptions = require('./product-menu-config.json');

import * as $ from 'jquery';

import './product-menu.less';

export default function(AppState, PubSub, $rootScope, $state) {

		var buildClassList = function(classes, username) {
			return _.reduce(classes, (courses, entry) => {
				if (entry.teacher === username) {
					courses.push({ id: entry.course_id, name: entry.name, product: entry.product });
				}
				return courses;
			}, []);
		};

		return {
			restrict: 'A',
			templateUrl: template,
			scope: {},
			link: function(scope, element, attrs) {

				var productMenu = $(element).find('.product-menu');

				scope.menuOptions = menuOptions;
				scope.amsco = true;
				scope.course = AppState.get('curCourse');

				var hasMathXBooks = AppState.get('hasMathx');
				var hasAMSCOBooks = AppState.get('hasAmsco');
//				var courses = AppState.get('courses');
				var courses = AppState.filteredCourses();
				var username = AppState.get('user_name');
				var isDistAdmin = AppState.get('isDistAdmin');
				var isPLCAdmin = AppState.get('isPLCAdmin');
				var isFppProduct = AppState.get('hasFpp');

				var isInside = false;

				var hasMathXClasses = false;
				var hasAMSCOClasses = false;
				var hasFppClasses = false;
				var hasClasses = false;
				var mustAddClass = false;

				scope.handleClick = () => {
					productMenu.toggle();
				};

				scope.navigateTo = (item) => {
					isInside = false;
					var state = (mustAddClass && item.noClassState) ? item.noClassState : item.state;
					$rootScope.app = state;
					$state.go(state);
					productMenu.hide();
				};

				var checkClasses = (courses) => {
					hasMathXClasses = false;
					hasAMSCOClasses = false;
					if (courses.length >= 1) {
						hasClasses = true;
						var courseTypes = _.map(courses, 'product');
						if (courseTypes.indexOf('amsco') >= 0) {
							hasAMSCOClasses = true;
						}
						if (courseTypes.indexOf('mathx') >= 0) {
							hasMathXClasses = true;
						}
						if (courseTypes.indexOf('fpp') >= 0) {
							hasFppClasses = true;
						}
					} else {
						hasClasses = false;
					}
					mustAddClass = !hasClasses && !isDistAdmin && !isPLCAdmin;
				};

				checkClasses(courses);

				productMenu.on('mouseenter', () => {
					isInside = true;
				});

				productMenu.on('mouseleave', () => {
					if (isInside) {
						isInside = false;
						productMenu.toggle();
					}
				});

				scope.isDisabled = (item) => {
					var result;

					if (item.state === 'reportsApp.asov') {
						if (hasAMSCOClasses && hasMathXBooks && !hasMathXClasses) {
							result = true;
						} else if (mustAddClass) {
							result = true;
						} else {
							result = false;
						}
					} else if (item.state === 'assignApp.list') {
						if (mustAddClass) {
							 result = true;
						} else {
							result = false;
						}
					} else if (item.state === 'adminApp.book') {
						if (mustAddClass) {
							 result = true;
						} else {
							result = false;
						}
					} else {
						result = !item.noClasses;
					}
					return result;
				};

				// Determine which menu configuration to use.
				function determineConfiguration() {
					var ebooksData = AppState.get('ebooksData');
					var bookshelfFlags = ebooksData.bookshelf;
					var config = 1024;
					// 1: Connections Grade 6
					// bookshelf.lang flag
					if (bookshelfFlags.lang) {
						config += 1;
					}
					// 2: MathX
					// hasMathXClasses || hasMathXBooks
					if (hasMathXClasses || hasMathXBooks) {
						config += 2;
					}
					// 3: Reading Essentials
					// bookshelf.pdf
					if (bookshelfFlags.ebooks || bookshelfFlags.pdf) {
						config += 4;
					}
					// 4: Handwriting Teacher Resources
					// bookshelf.handwriting
					if (bookshelfFlags.handwriting) {
						if (isDistAdmin || isPLCAdmin) {
							config += 64;
						} else {
							config += 8;
						}
					}
					// 5: FPP National
					// bookshelf.custom?
					if (bookshelfFlags.custom) {
						config += 16;
					}
					// 6: AMSCO Teacher
					// hasAMSCOClasses
					if (hasAMSCOClasses || hasAMSCOBooks) {
						config += 32;
					}
					// 1,2:
					// 1,3:
					// 1,4:
					// 2,3:
					// 2,4:
					// 3,4:
					// 1,2,3:
					// 1,2,4:
					// 1,3,4:
					return config;
				}

				function isItemInConfiguration(config, itemConfig) {
					var result = false;
					itemConfig.forEach(i => {
						result |= (i & config);
					});
					return result;
				}

				scope.showMenuOption = (item) => {
					var config = determineConfiguration();
					var show = isItemInConfiguration(config, item.config);
					//console.log('showMenuOption item.config, config', item.config, config);
					//console.log('showMenuOption showItem? ', isItemInConfiguration(config, item.config));
					return show;
				};

				PubSub.subscribe('StateChange:classes', (classes) => {
					checkClasses(classes);
				});

				scope.$on('class change', (e, course) => {
					scope.course = course;
					// This is probably where we would update stdList
					AppState.refresh();
				});

			}
		};

	};
