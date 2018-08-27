'use strict';

import './less/master.less';

import actionsService from './components/actions/actions-service.ts';
import barChartDirective from './components/bar-chart/kb-bar-chart-directive.ts';
import singleBarDirective from './components/single-bar/kb-single-bar-directive.ts';
import svgDirective from './components/svg-filters/kb-svg-filters-directive.ts';
import tripleBarDirective from './components/triple-bar/kb-triple-bar-directive.ts';

import dataManager from './components/data-tools/data-manager-service.ts';
import reportCalcService from './components/data-tools/report-calc-service.ts';
import filterBarDirective from './components/filter-bar/filter-bar-directive.ts';
import filterBarController from './components/filter-bar/filter-bar-controller.ts';
import assignmentService from './components/models/filter-lists/assignments-service.ts';
import categoryService from './components/models/filter-lists/category-service.ts';
import filterManagerService from './components/models/filter-lists/filter-manager-service.ts';
import rosterService from './components/models/filter-lists/roster-service.ts';
import standardService from './components/models/filter-lists/standard-service.ts';
import gradeRangeService from './components/models/grade-ranges-service.ts';
import gradeService from './components/models/grades-service.ts';
import dateRangeController from './components/options/date-range-controller.ts';
import gradeRangeController from './components/options/grade-range-controller.ts';
import assignListController from './components/reports/assign-list/assign-list-controller.ts';
import assignOverviewController from './components/reports/assign-overview/assign-overview-controller.ts';
import assignProblemsController from './components/reports/assign-problems/assign-problems-controller.ts';
import assignStudentsController from './components/reports/assign-students/assign-students-controller.ts';
import standardListController from './components/reports/standard-list/standard-list-controller.ts';
import standardProblemsController from './components/reports/standard-problems/standard-problems-controller.ts';
import standardStudentsController from './components/reports/standard-students/standard-students-controller.ts';
import standardOverviewController from './components/reports/standard-overview/standard-overview-controller.ts';
import filterModalController from './components/shared-modals/filter-modal-controller.ts';
import showNamesController from './components/shared-modals/names-list-controller.ts';

import './../../core/filters/module.ts';

export default angular.module('reports', [
	'core.filters',
	'core.vtp'
])

.service('ReportData', dataManager)
.service('ReportActions', actionsService)
.service('ReportCalc', reportCalcService)
.service('AssignmentModel', assignmentService)
.service('CategoryModel', categoryService)
.service('FilterManager', filterManagerService)
.service('RosterModel', rosterService)
.service('StandardModel', standardService)
.service('GradeRanges', gradeRangeService)
.service('GradeData', gradeService)

.controller('DateRangeCtrl', dateRangeController)
.controller('GradeRangeCtrl', gradeRangeController)
.controller('FilterBarCtrl', filterBarController)
.controller('AsListCtrl', assignListController)
.controller('AssignmentsOverviewCtrl', assignOverviewController)
.controller('AsProbCtrl', assignProblemsController)
.controller('AsStdCtrl', assignStudentsController)
.controller('StdListCtrl', standardListController)
.controller('StandardsOverviewCtrl', standardOverviewController)
.controller('StdProbCtrl', standardProblemsController)
.controller('StdStdCtrl', standardStudentsController)
.controller('FilterModalCtrl', filterModalController)
.controller('ShowNamesCtrl', showNamesController)

.directive('filterBar', filterBarDirective)
.directive('kbSingleBar', singleBarDirective)
.directive('kbSvgFilters', svgDirective)
.directive('kbTripleBar', tripleBarDirective)
.directive('barChart', barChartDirective)


// Route list

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	// Routing Table
	$stateProvider

		.state('reportsApp', {
			url: '/reports',
			templateUrl: require('./app.html')
		})

		.state('reportsApp.asov', {
			url: '/overview',
			templateUrl: require('./components/reports/assign-overview/assign-overview.html'),
			controller: 'AssignmentsOverviewCtrl as graph',
			options: {
					'id': 'asov',
					'text': 'Overview',
					'state': 'reportsApp.asov',
					'filters': ['student'],
					'calc': 'assignOverview',
					'summary': 'This graph shows class performance broken down by assignment category, such as <b>homework</b> or <b>quizzes</b>.'
			}
		})

		.state('reportsApp.aslist', {
			url: '/aslist',
			templateUrl: require('./components/reports/assign-list/assign-list.html'),
			controller: 'AsListCtrl as graph',
			options: {
				'id': 'aslist',
				'text': 'Student Reports',
				'state': 'reportsApp.aslist',
				'filters': ['category', 'student'],
				'calc': 'assignList',
				'summary': '<p>Displays a list of all assignments, and associated class ' +
					'or student performance.</p>The list can optionally be limited to a single assignment category or student.'
			}
		})

		.state('reportsApp.asstd', {
			url: '/asstd',
			templateUrl: require('./components/reports/assign-students/assign-students.html'),
			controller: 'AsStdCtrl as graph',
			options: {
				'id': 'asstd',
				'text': 'Assignment Reports',
				'state': 'reportsApp.asstd',
				'filters': ['assign'],
				'calc': 'assignStudents',
				'summary': 'This page shows individual student performance across all assignments, a single category, or a single assignment.'
			}
		})

		.state('reportsApp.asprob', {
			url: '/asprob',
			templateUrl: require('./components/reports/assign-problems/assign-problems.html'),
			controller: 'AsProbCtrl as graph',
			options: {
				'id': 'asprob',
				'text': 'Problem List',
				'state': 'reportsApp.asprob',
				'filters': ['assign', 'student'],
				'calc': 'assignProblems',
				'postCalc': 'loadProblems',
				'summary': 'Here you can check the performance of one or all students on each problem in an assignment.'
			}
		})

		.state('reportsApp.stdov', {
			url: '/standards-overview',
			templateUrl: require('./components/reports/standard-overview/standard-overview.html'),
			controller: 'StandardsOverviewCtrl as graph',
			options: {
        'id': 'stdov',
        'filters': ['student'],
        'text': 'Overview',
        'state': 'reportsApp.stdov',
        'calc': 'standardOverview',
        'summary': '<p>This graph shows class performance for each top-level standard.</p>' +
			'You can click on any standard to see a more detailed breakdown.'
      }
		})

		.state('reportsApp.stdlist', {
			url: '/stdlist',
			templateUrl: require('./components/reports/standard-list/standard-list.html'),
			controller: 'StdListCtrl as graph',
			options: {
        'id': 'stdlist',
        'text': 'Student Reports',
        'state': 'reportsApp.stdlist',
        'filters': ['standard', 'student'],
        'calc': 'standardList',
        'summary': 'Displays a list of all covered standards, and associated class or student performance.'
      }
		})

		.state('reportsApp.stdstd', {
			url: '/stdstd',
			templateUrl: require('./components/reports/standard-students/standard-students.html'),
			controller: 'StdStdCtrl as graph',
			options: {
        'id': 'stdstd',
        'text': 'Standard Reports',
        'state': 'reportsApp.stdstd',
        'filters': ['standard'],
        'calc': 'assignStudents',
        'summary': 'This page shows individual student performance across a single standard, a top-level standard, or all standards.'
      }
		})

		.state('reportsApp.stdprob', {
			url: '/stdprob',
			templateUrl: require('./components/reports/standard-problems/standard-problems.html'),
			controller: 'StdProbCtrl as graph',
			options: {
        'id': 'stdprob',
        'text': 'Problem List',
        'state': 'reportsApp.stdprob',
        'filters': ['standard', 'student'],
        'calc': 'assignProblems',
        'postCalc': 'loadProblems',
        'summary': 'Here you can check the performance of one or all students on each problem covered by a given standard.'
      }
		});

});
