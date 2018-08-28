'use strict';

import './less/master.less';

import passwordController from './components/password/password-controller.ts';
import emailController from './components/email/email-controller.ts';

export default angular.module('settings', [])
.controller('PasswordCtrl', passwordController)
.controller('EmailCtrl', emailController)

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider

		.state('settingsApp', {
			url: '/settings',
			templateUrl: require('./app.html')
		})

		.state('settingsApp.email', {
			url: '/email',
			templateUrl: require('./components/email/email.html'),
			controller: 'EmailCtrl as ctrl'
		})

		.state('settingsApp.password', {
			url: '/password',
			templateUrl: require('./components/password/password.html'),
			controller: 'PasswordCtrl as ctrl'
		});

});
