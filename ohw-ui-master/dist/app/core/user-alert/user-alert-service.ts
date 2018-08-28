'use strict';

export default function($uibModal, State) {
	var alerts = require('./user-alert.json');
	var currentAlert = alerts[0];

	var userAlert = {};
	userAlert.getCurrentAlert = function() {
		return currentAlert;
	};

	userAlert.showAlert = function(type) {
		var file = './alerts/' + currentAlert.file + '.html';
    var templateUrl = require(file);
		var result = $uibModal.open({
			templateUrl: templateUrl,
			controller: 'userAlertCtrl as ctrl',
			resolve: {
				data: function() {
					return ['just checking'];
				}
			}
		});

		return result;

	};

	return userAlert;

};
