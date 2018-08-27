'use strict';

import notificiationsInterceptor from './notifications-interceptor.ts';
import notificationsDirective from './notifications-directive.ts';
import './notifications.less';

export default angular.module('core.notifications', [])
	.directive('notifications', notificationsDirective)
	.factory('NotificationsInterceptor', notificiationsInterceptor)
	.constant('NotificationsConfig', {
		PATH: 'notifications/'
	})
	.config(function($httpProvider) {
		$httpProvider.interceptors.push('NotificationsInterceptor');
	});
