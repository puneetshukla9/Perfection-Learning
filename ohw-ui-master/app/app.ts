'use strict';

import './app.less';
import './core/less/mathx-font.less';
import 'angular-ui-router';
import 'angular-hotkeys';
import 'd3';
import 'ng-tags-input';

import './../vendor/temp-datetime-picker.js';
import './core/api/module.ts';
import './core/app-state/module.ts';
import './core/assignment-type-menu/module.ts';
import './core/class-menu/module.ts';
import './core/product-list-menu/module.ts';
import './core/shared-by-menu/module.ts';
import './core/user-preferences/module.ts';
import './core/header-bar/module.ts';
import './core/module-menu/module.ts';
import './core/product-menu/module.ts';
import './core/subject-dropdown/module.ts';
import './core/user-alert/module.ts';
import './core/logout/module.ts';
import './core/autologout/module.ts';
import './core/image-overlay/module.ts';
import './core/filters/module.ts';
import './core/calendar/module.ts';
import './core/autologout/module.ts';
import './core/spinner/module.ts';
import './core/table/module.ts';
import './core/localization/module.ts';
import './core/print-preview/module.ts';
import './core/pubsub-factory.ts';
import './core/problem-types/module.ts';
import './core/wizard/module.ts';
import './core/save-button/module.ts';
import './core/spinner/module.ts';
import './core/notifications/module.ts';
import './core/mathjax/module.ts';
import './core/vtp/module.ts';
import './core/scinote/module.ts';
import './core/user-menu/module.ts';
import './core/manuals/module.ts';
import './core/bookshelf/module.ts';

import hideOnRoute from './core/hide-on-route-directive.ts';
import mathxSuperscript from './core/math-superscript-module.ts';
import hideBodyOverflow from './core/hide-body-overflow-directive.ts';
import hideOnState from './core/hide-on-state-directive.ts';
import scrollToTop from './core/scroll-to-top-directive.ts';
import snapToGrid from './core/snap-to-grid-directive.ts';
import triggerClick from './core/trigger-click-directive.ts';
import fileDrop from './core/file-drop-directive.ts';
import fileRead from './core/file-read-directive.ts';
import passwordHideShow from './core/password-directive.ts';
import graphDirective from './core/graph-directive.ts';
import scrollToTopWhen from './core/scroll-to-top-when-directive.ts';
import truncateName from './core/trunc-name-module.ts';
import dateConvert from './core/date-convert-service.ts';
import sortService from './core/sort-service.ts';
import gridPagination from './core/grid-pagination-service.ts';
import sortIcon from './core/sort-icon/sort-icon-directive.ts';
import hotkey from './core/hotkeys/hotkey-service.ts';
import oneRoster from './core/oneroster-service.ts';

import './modules/digital-library/module';
import './modules/admin/module';
import './modules/assignments/module';
import './modules/assignment-generator/module';
import './modules/grade-change/module';
import './modules/reports/module';
import './modules/settings/module';
import './modules/support/module';

import errorController from './error/error-controller.ts';

export default angular.module('ohw', [
	'ui.bootstrap',
	'ui.bootstrap.datetimepicker',
	'ui.router',
	'ngTagsInput',
	'cfp.hotkeys',
	'core.pubsub',
	'core.api',
	'core.appstate',
	'core.assignmenttypemenu',
	'core.classmenu',
	'core.productlistmenu',
	'core.sharedbymenu',
	'core.preferences',
	'core.header',
	'core.modulemenu',
	'core.usermenu',
	'core.productmenu',
	'core.useralert',
	'core.subjectdropdown',
	'core.printpreview',
	'core.problemtype',
	'core.savebutton',
	'core.wizard',
	'core.autologout',
	'core.calendar',
	'core.qimage',
	'core.filters',
	'core.spinner',
	'core.notifications',
	'core.table',
	'core.localization',
	'core.mathjax',
	'core.vtp',
	'core.scinote',
	'core.logout',
	'core.manuals',
	'core.bookshelf',
	'digitalLibrary',
	'admin',
	'assign',
	'assignGen',
	'gradeChange',
	'reports',
	'settings',
	'support'
])
.directive('hideOnRoute', hideOnRoute)
.directive('hideBodyOverflow', hideBodyOverflow)
.directive('hideOnState', hideOnState)
.directive('scrollToTop', scrollToTop)
.directive('snapToGrid', snapToGrid)
.directive('triggerClick', triggerClick)
.directive('fileDrop', fileDrop)
.directive('fileRead', fileRead)
.directive('passwordHideShow', passwordHideShow)
.directive('mathxSuperscript', mathxSuperscript)
.directive('kbGraph', graphDirective)
.directive('scrollToTopWhen', scrollToTopWhen)
.directive('kbSortIcon', sortIcon)
.service('TruncateName', truncateName)
.service('DateConvert', dateConvert)
.service('Sort', sortService)
.service('GridPagination', gridPagination)
.service('Hotkey', hotkey)
.service('OneRoster', oneRoster)
.controller('ErrorController', errorController)

.config(function($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sceProvider, $compileProvider) {

	$locationProvider.html5Mode({
		enabled: true,
		requireBase: true,
		rewriteLinks: false
	});

	$httpProvider.defaults.withCredentials = true;
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
	$httpProvider.interceptors.push('APIInterceptor');
	$httpProvider.defaults.cache = true;
	// get rid of this
	$sceProvider.enabled(false);

})
.run(function($urlRouter, $rootScope, Config, Util, Preferences, $state, AppState) {

	var userLevel = AppState.get('permissions');
	var hasMathX = AppState.get('hasMathx');
	var hasAMSCO = AppState.get('hasAmsco');
	var hasFpp = AppState.get('hasFpp');
//	var courses = AppState.get('courses');
	var digitalBooks = AppState.setDigitalBooks();
	var courses = AppState.filteredCourses();
	var isStudent = AppState.get('isStudent');
	var isTeacher = AppState.get('isTeacher');
	var isSchoolAdmin = AppState.get('isSchoolAdmin');
	var isDistAdmin = AppState.get('isDistAdmin');
	var isPLCAdmin = AppState.get('isPLCAdmin');
	var defaultCourse = AppState.get('defaultCourse');
	var hasSchool = !!AppState.get('school_id'); // Allow for non-school user.
	console.log('hasSchool', hasSchool);
	var ebooksNoClassFlag = AppState.get('ebooksNoClassFlag');
	var ebooksData = AppState.get('ebooksData');
	var bookshelf = ebooksData.bookshelf;
	var isHandwriting = bookshelf.handwriting;

	var destination;

	$rootScope.appInitialized = false;
	$rootScope.readerLayout = true;

	// setUseNewStudentApp: Return a flag indicating whether or not to use the new student app.
	// Currently, the criteria are:
	// a) has courses with Technology-enhanced items for NY and FL
	// b) useNewApp flag is set from bootstrap data.
	function setUseNewStudentApp() {
		var result = false;
		var TEIStates = ['FL', 'NY'];
		// TEIStates is needed for the list-controller for the Assignment List.
		AppState.set('TEIStates', TEIStates);
		TEIStates.forEach((state) => {
			if (_.find(courses, { product_state: state })) {
				result = true;
			}
		});

		if (AppState.get('useNewApp')) {
			result = true;
		}

		return result;
	}

	var useNewStudentApp = setUseNewStudentApp();

//	var hasFlCourses = _.find(courses, { product_state: 'FL' });
//	var hasNYCourses = _.find(courses, { product_state: 'NY' });
	var hasMathXCourses = _.find(courses, { product: 'mathx' });
	var hasAMSCOCourses = _.find(courses, { product: 'amsco' });

	if (hasFpp) {
		$rootScope.product = 'fpp';
	} else if (hasMathX || hasMathXCourses) {
		$rootScope.product = 'mathx';
	} else if (hasAMSCOCourses && !isPLCAdmin) { // explicitly check for AMSCO courses before setting rootScope.product to 'amsco'.
		$rootScope.product = 'amsco';
	}

	var studentApp = function() {
		Util.wrap(false).then(() => {

			let appDir = 'student';

			//if on ipad or on android tablet, change directory to ipad-centric layout

			var androidChromeUA = new RegExp('Android', 'g');
			var iPadUA = new RegExp('iPad', 'g');
			var studentAppURL;

			if ((iPadUA.test(navigator.userAgent) || androidChromeUA.test(navigator.userAgent)) && !window.MSStream) {
					appDir = 'student-ipad';
			}

			// Set the URL for the student app. Current possibilities are:
			// a) Physics app (developed by Mitr)
			//    Use this if the hasFpp flag is set in the bootstrapped data.
			// b) New student app (developed by Mitr)
			//    Use if the user meets the criteria for the new app. The flag is set by setUseNewStudentApp().
			// c) Old student app (developed by KineticBooks)
			//    Use if the tests for a) and b) don't pass.
			if (hasFpp) {
				if (useNewStudentApp) {
					// For new student app, FPP goes to new Mitr digital library, rather than to Mitr FPP book.
					studentAppURL = window.location.protocol + '//' + window.location.hostname + '/books/student-app/index.html';
				} else {
					studentAppURL = window.location.protocol + '//' + window.location.hostname + '/books/fpp/Chapters/index.html';
				}
				//window.location.href = window.location.protocol + '//' + window.location.hostname + '/books/fpp/Chapters/index.html';
			} else {
				// For trial: NY and FL students go to new student app.
				// Use the criteria specified in the setUseNewStudentApp() function.
				if (useNewStudentApp) {
					studentAppURL = window.location.protocol + '//' + window.location.hostname + '/books/student-app/index.html';
					//window.location.href = window.location.protocol + '//' + window.location.hostname + '/books/student-app/index.html';
				} else {
					studentAppURL = window.location.protocol + '//' + window.location.hostname + '/books/' + appDir + '/project.html#assignments';
					//window.location.href = window.location.protocol + '//' + window.location.hostname + '/books/' + appDir + '/project.html#assignments';
				}
			}

			window.location.href = studentAppURL;
		});
	};

	var isManualRequest = window.ohw.originalRequest.indexOf('/manuals/') >= 0;

	if (isManualRequest) {
		destination = 'manuals';
	} else if (isStudent) { // student
		destination = false;
		// added hasSchool condition to check for school_id of false, to allow for user not associated with school (school ID -2)
	  if (!defaultCourse && hasSchool) {
			destination = 'errorNoClass';
		} else {
			studentApp();
			return;
		}
	} else if (isHandwriting) {
		console.log('No Class flag set');
		destination = 'libraryApp.bookshelf.userBookshelf';
	} else if (courses && courses.length) {
		if ( isSchoolAdmin || isTeacher) {
			// The && !digitalBooks condition was added to prevent teachers with digital books but not custom ones
			// from being redirected to the assignment list.
			if (!hasMathX && !hasMathXCourses && !digitalBooks) {
				destination = 'assignApp.list';
			} else {
				destination = 'adminApp.classes.classesList';
			}
		}
	} else {
		destination = 'adminApp.addClass';
	}

	//PLC Admin,
	//District admin - starting route is license list
// What if the handwriting flag is already set? In general, what condition determines whether to check for isPLC / isDist?
	if (isPLCAdmin) {
		destination = 'adminApp.plcLicenses.licenseList';
	} else if (isDistAdmin) {
		destination = 'adminApp.licenses.licenseList';
	}

	// if s_admin or any other user has *any* mathx products, give them everything (MathX menu)
	// on initial load, take them to admin

	// if s_admin or any other user has *only* amsco products, give them only amsco
	// take them to assignment list

	if (destination) $state.go(destination);

	// This is added to check for the bookRead state and set the readerLayout flag accordingly.
	// This prevents the unaesthetic briefly flashed header and product menu on the left when the book reader loads in a separate tab.
	$rootScope.$on('$stateChangeSuccess', function () {
		if ($state.current.name !== 'libraryApp.bookRead') {
			$rootScope.readerLayout = false;
		}
	});

	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
		$state.previous = fromState;
	});

	$rootScope.$on('$stateChangeSuccess', function(e, state) {
		// is this a module change?
		var prevName = AppState.getModuleName(state.previous);
		var name = AppState.getModuleName(state);
		if (prevName !== name) $rootScope.$broadcast('module change', name, state);
	});

	Preferences.init();
	$rootScope.appInitialized = true;
	$rootScope.Config = Config;

})
.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
	$stateProvider
		.state('errorNoClass', {
			url: 'error/noclass',
			controller: 'ErrorController',
			templateUrl: require('./error/error-no-class.html')
		})
		.state('logout', {
			url: '/logout',
			controller: 'LogoutCtrl'
		})
		.state('manuals', {
			url: '/manuals/:filename',
			controller: 'ManualsCtrl',
			templateUrl: require('./core/manuals/manuals-template.html')
		});
});
