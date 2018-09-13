'use strict';

import './less/master.less';
import './components/change/change.less';

import changeCtrl from './components/change/change-controller.ts';
import problemModel from './components/models/problem-model.ts';
import changePointsDirective from './components/change/change-points-directive.ts';
import correctAnswerDirective from './components/change/correct-answer-directive.ts';
import studentAnswerDirective from './components/change/student-answer-directive.ts';
import rubricDirective from './components/change/rubric-directive.ts';
import rubricItemDirective from './components/change/rubric-item-directive.ts';

export default angular.module('gradeChange', [])

.service('Problems', problemModel)

.directive('changePoints', changePointsDirective)
.directive('correctAnswer', correctAnswerDirective)
.directive('studentAnswer', studentAnswerDirective)
.directive('rubric', rubricDirective)
.directive('rubricItem', rubricItemDirective)

.controller('ChangeCtrl', changeCtrl)

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider

		.state('gradeChangeApp', {
			url: '/grade-change',
			templateUrl: require('./app.html')
		})

		.state('gradeChangeApp.pendingAssignStudent', {
			url: '/pending/:assign/:student',
			templateUrl: require('./components/change/change.html'),
			controller: 'ChangeCtrl as change'
		})

		.state('gradeChangeApp.pendingAssign', {
			url: '/pending/:assign',
			templateUrl: require('./components/change/change.html'),
			controller: 'ChangeCtrl as change'
		})

		.state('gradeChangeApp.assignStudent', {
			url: '/:assign/:student',
			templateUrl: require('./components/change/change.html'),
			controller: 'ChangeCtrl as change'
		})

		.state('gradeChangeApp.assign', {
			url: '/:assign',
			templateUrl: require('./components/change/change.html'),
			controller: 'ChangeCtrl as change'
		});

});
