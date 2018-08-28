'use strict';

export default function($http) {

    var API = {};

    var p = window.location.protocol;
    var w = window.location.hostname;
    var a;

    if (w === 'localhost') {
      w = 'test-ohw.kineticmath.com';
      a = p + '//' + w;
      API.BASE = a + '/rest/endpoint.php/';
      API.REST_BASE = a + '/rest/rest.php/';
      API.LOGIN_BASE = 'https://qa1.perfectionlearning.com/api/login/';
    } else {
      a = p + '//' + w;
      API.BASE = a + '/api/endpoint/';
      API.REST_BASE = a + '/api/rest/';
      API.LOGIN_BASE = a + '/api/login/';
    }


    API.appendTransform = function(transform) {
      var defaults = $http.defaults.transformResponse;
      defaults = angular.isArray(defaults) ? defaults : [defaults];
      return defaults.concat(transform);
    };

    return API;

  };
