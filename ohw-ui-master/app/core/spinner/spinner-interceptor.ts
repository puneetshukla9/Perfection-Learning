'use strict';

export default function ($rootScope, $q) {

    var numLoadings = 0;

    return {
      request: function (config) {
         numLoadings++;
         $rootScope.$broadcast('spinner show');
         return config || $q.when(config);
       },
      response: function (response) {
        if ((--numLoadings) === 0) {
          // Hide loader
          $rootScope.$broadcast('spinner hide');
        }
       return response || $q.when(response);

      },
      responseError: function (response) {
        if (!(--numLoadings)) {
          // Hide loader
          $rootScope.$broadcast('spinner hide');
        }
        return $q.reject(response);
      }
    };
};
