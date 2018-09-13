'use strict';

export default function(Preferences, $rootScope, userAlertService) {
		var templateUrl = require('./user-alert.html');

		function isNewAlert() {
			var currentAlert = userAlertService.getCurrentAlert();
			var userAlertDate = Preferences.get('userAlert');
			return !(userAlertDate && currentAlert.alertDate <= userAlertDate);
		}

		return {
      restrict: 'A',
      scope: true,
			templateUrl: templateUrl,
			replace: true,
			link: function(scope, elem, attrs) {
        $rootScope.$on('user alert off', () => { scope.showAlertButton = false; });

        scope.showAlertButton = isNewAlert();
				// Per https://trello.com/c/EDAQBkSy/93-turn-off-the-new-feature-button-message-so-the-most-recent-message-isnt-showing
				// Turn off this button for now.
				scope.showAlertButton = false;
        scope.showUserAlert = () => {
          userAlertService.showAlert('newFeatures');
        };
			}
		};

	};
