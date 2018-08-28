'use strict';

export default function($scope, $rootScope, $uibModalInstance, userAlertService, Preferences, data) {
  var currentAlert = userAlertService.getCurrentAlert();

  $scope.userGuideLink = 'http://files.kineticbooks.com/guides/fpp-user-manual.pdf';

  $scope.continue = () => {
    Preferences.set('userAlert', currentAlert.alertDate);
    $rootScope.$broadcast('user alert off');
    $uibModalInstance.close({ bool: true, scope: $scope, data: data }); // was true
  };
};
