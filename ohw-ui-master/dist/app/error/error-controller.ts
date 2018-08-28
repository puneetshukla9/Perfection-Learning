'use strict';

export default function($scope, Auth) {

  $scope.handleLogout = function() {
    Auth.logout().then(() => {
      window.location.href = `/auth/main`;
    }, () => {
      window.location.href = `/auth/main`;
    });
  };

};
