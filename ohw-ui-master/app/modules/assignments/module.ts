'use strict';

import './less/calendar.less';
import './less/date-modal.less';
import 'mathjax';
import 'angular-ui-grid/ui-grid';
import 'lodash';
// import 'ng-sortable';
import './components/models/module.ts';
import './components/gradebook/module.ts';
import './components/list/module.ts';
import './components/options/module.ts';
import assignmentsData from './components/data-manager-service.ts';
import tableDefaults from '../../core/table/table-defaults-factory.ts';

angular.module('assign', [
	'ui.grid',
	'ui.grid.autoResize',
	'ui.grid.importer',
	'ui.grid.rowEdit',
	'ui.grid.pinning',
	'ui.grid.edit',
	'ui.grid.cellNav',
	'ui.grid.exporter',
	'assign.models',
	'assign.gradebook',
	'assign.list',
	'assign.options'
])

.service('AssignmentsData', assignmentsData)
.factory('TableDefaults', tableDefaults)

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		.state('assignApp', {
			url: '/assignments',
			templateUrl: require('./app.html')
		})
		.state('assignApp.list', {
			url: '/list',
			templateUrl: require('./components/list/list.html'),
			controller: 'ListCtrl as list'
		})
		.state('assignApp.sharedList', {
			url: '/assignment-library',
			templateUrl: require('./components/list/list.html'),
			controller: 'ListCtrl as list',
			params: {
				showOnlyShared: true
			}
		})
		.state('assignApp.gradebook', {
			url: '/gradebook',
			templateUrl: require('./components/gradebook/gradebook.html'),
			controller: 'GradebookCtrl as ctrl'
		});

});
