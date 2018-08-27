'use strict';

var appConfig = require('./../../../../config/application-config.json');

export default function ($rootScope, $q) {

		// urls from the response and rejection look like this:
		return {

			request: function(config) {
				return config;
			},

			response: function(response) {
				// console.log('interceptor 1 (api)')
				// when JSON is returned, validate success and return the body
				// this must be the last interceptor in the array in order to work properly
				// if the route has a transformer registered, that will be executed instead
				if (response.config.headers.Accept.indexOf('application/json') >= 0) {
					if (!_.has(response.data, 'data')) return response;
					if (response.data.status === 'success') {
						response = response.data.data;
						return response;
					} else if (response.data.status === 'NOT_LOGGED_IN') {
						window.location.href = window.location.protocol + '//' + window.location.hostname + appConfig.url.login;
						return $q.reject(response);
					}
				}
				return response;
			}

		};

};
