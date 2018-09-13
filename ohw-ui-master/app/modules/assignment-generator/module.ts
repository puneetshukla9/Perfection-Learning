'use strict';

import './less/master.less';
import 'ng-sortable';
//

import dragScrollDirective from './components/drag-scroll/drag-scroll-directive.ts';

import chooseCtrl from './components/choose/choose-controller.ts';
import detailsCtrl from './components/details/details-controller.ts';
import editCtrl from './components/edit/edit-controller.ts';
import rosterCtrl from './components/roster/roster-controller.ts';
import previewCtrl from './components/preview/preview-controller.ts';
import assignHelper from './components/models/assign-helper.ts';
import problemHelper from './components/models/problem-helper.ts';
import assignGenWizardCtrl from './wizards/ag-controller.ts';
import tempIdService from './temp-id-service.ts';

import './../../core/vtp/module.ts';
import tableDefaults from '../../core/table/table-defaults-factory.ts';

import 'angular-material-icons';

export default angular.module('assignGen', [
	'as.sortable',
	'core.vtp',
	'ngMdIcons'
])

.service('TempID', tempIdService)
.service('AssignmentHelper', assignHelper)
.service('ProblemHelper', problemHelper)

.controller('ChooseCtrl', chooseCtrl)
.controller('DetailsCtrl', detailsCtrl)
.controller('EditCtrl', editCtrl)
.controller('RosterCtrl', rosterCtrl)
.controller('PreviewCtrl', previewCtrl)
.controller('AssignGenWizardCtrl', assignGenWizardCtrl)

.directive('dragScroll', dragScrollDirective)
.factory('TableDefaults', tableDefaults)

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider
		.state('assignGenApp', {
			url: '/assignment-generator',
			templateUrl: require('./wizards/ag-wizard.html'),
			controller: 'AssignGenWizardCtrl'
		})
		.state('assignGenApp.choose', {
			url: '/choose/:id',
			templateUrl: require('./components/choose/choose.html'),
			controller: 'ChooseCtrl as choose'
		})
		.state('assignGenApp.details', {
			url: '/details/:id',
			params: {
				shared: null
			},
			templateUrl: require('./components/details/details.html'),
			controller: 'DetailsCtrl as details'
		})
		.state('assignGenApp.edit', {
			url: '/edit/:id',
			templateUrl: require('./components/edit/edit.html'),
			controller: 'EditCtrl as edit'
		})
		.state('assignGenApp.roster', {
			url: '/roster/:id',
			templateUrl: require('./components/roster/roster.html'),
			controller: 'RosterCtrl as roster'
		})
		.state('assignGenApp.preview', {
			url: '/preview/:id',
			templateUrl: require('./components/preview/preview.html'),
			controller: 'PreviewCtrl as preview'
		});

});
