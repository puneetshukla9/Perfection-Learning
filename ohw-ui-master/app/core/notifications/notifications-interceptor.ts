'use strict';

export default function (Localization, $rootScope, $q) {

    // urls from the response and rejection look like this:
    // http://test-ohw.kineticmath.com/rest/endpoint.php/admin/district/schools/all"
    var WHITELIST = ['/prefs/category', '/prefs',
                     '/admin/district/licenses/list']; // detecting district admin vs school admin in student upload
    var PATH_WHITELIST = ['/Admin/upload-wizard/table'];
    var UNKNOWN_ERROR = 'An unknown error occurred. ';
    var OVERRIDES = [
      {
          urlRe: /\/admin\/course\/\d+\/student\/\d+$/,
          method: 'PUT',
          message: 'Some students were not added to your class because there are not enough available licenses. ' +
                 'Please contact your administration or Perfection Learning to purchase more licenses.',
          statusText: 'INVALID_INPUT_VALUES'

       },
       {
           urlRe: /\/admin\/course\/\d+\/student\/\d+$/,
           method: 'PUT',
           message: 'This student is already in the specified class.',
           statusText: 'ALREADY_IN_COURSE'

        },
        {
            urlRe: /\/assign\/import\/.+$/,
            method: 'PUT',
            message: '',                         // blank message: suppress notification.
            statusText: 'CANNOT_OVERWRITE'

         }
    ];

    var override = function(response) {
      var config = response.config || '';
      var method = config && config.method || '';
      var url = config && config.url || '';
      var returnCode = response.data.status || '';
      var shouldOverride = false;
      if (method && url) {
        OVERRIDES.forEach((item) => {
          if (item.urlRe.test(url) && item.method === method && item.statusText === returnCode) {
            shouldOverride = item;
          }
        });
      }
      return shouldOverride;
    };

    var inList = function(str, list) {
      var result = false;
      _.each(list, function(entry, i) {
        if (str.indexOf(entry) >= 0) result = true;
      });
      return result;
    };

    return {

      response: function(response) {
        // console.log('interceptor 2 (notif)')
        // this is for the wrapped version (Admin)
        var url = _.has(response, 'config') && _.has(response.config, 'url') && response.config.url ?
          response.config.url : '';
        if (_.has(response.data, 'status') && response.data.status !== 'success'  ) {
          if (inList(url, WHITELIST) ||
              inList(window.location.pathname, PATH_WHITELIST)) return response;
          var overrideObj = override(response), message;
          var suppressMessage = false;
          if (overrideObj) {
            message = overrideObj.message;
            suppressMessage = message.length === 0;
          } else {
            message = Localization.get('api', response.data.status);
            message = message || UNKNOWN_ERROR;
          }
          if (!suppressMessage) {
            $rootScope.$broadcast('notification error', { message:  message });
            return $q.reject(response);
          }
        }

        return response;
      },

      responseError: function(rejection) {
        var url = _.has(rejection, 'config') && _.has(rejection.config, 'url') && rejection.config.url ? rejection.config.url : '';
        if (!inList(url, WHITELIST)) {
          if (_.has(rejection, 'data') && _.has(rejection.data, 'Code')) {
            var message = Localization.get('api', rejection.data.Code);
            message = message || UNKNOWN_ERROR;
            $rootScope.$broadcast('notification error', { message:  message });
          } else {
            $rootScope.$broadcast('notification error', { message: UNKNOWN_ERROR + 'Error code: ' + rejection.statusText + '.' });
          }
        }
        return $q.reject(rejection);
      }

    };

};
