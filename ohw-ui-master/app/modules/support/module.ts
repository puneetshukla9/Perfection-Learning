'use strict';

import gettingStartedController from './components/getting-started/getting-started-controller.ts';
import videoDirective from './components/video-directive.ts';
import youTubeDirective from './components/youtube-directive.ts';
import vimeoDirective from './components/vimeo-directive.ts';
import './less/support.less';

export default angular.module('support', [])
.directive('youtube', youTubeDirective)
.directive('videoSrc', videoDirective)
.directive('vimeo', vimeoDirective)
.controller('GettingStartedController', gettingStartedController)
.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
	$stateProvider
		.state('supportApp', {
			url: '/support',
			templateUrl: require('./app.html')
		})
		.state('supportApp.start', {
			url: '/start',
			templateUrl: require('./components/getting-started/getting-started.html'),
			controller: 'GettingStartedController'
		});
});
