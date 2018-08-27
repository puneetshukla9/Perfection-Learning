'use strict';

import spinnerDirective from './spinner-directive.ts';
import spinnerInterceptor from './spinner-interceptor.ts';
import './spinner.less';

export default angular.module('core.spinner', [])
	.factory('SpinnerInterceptor', spinnerInterceptor)
	.directive('spinner', spinnerDirective)
	.constant('SpinnerConfig', {
		PATH: 'spinner/'
	})
	.config(function($httpProvider) {
		$httpProvider.interceptors.push('SpinnerInterceptor');
	});
