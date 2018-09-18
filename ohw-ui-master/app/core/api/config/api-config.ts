'use strict';

export default function($http) {

    var API = {};

    var p = window.location.protocol;
    var w = window.location.hostname;
    var a;
    w ='localhost';
    var lti_map = {
      test: 'https://testapi.perfectionlearning.com/lti/',
      live: 'https://api.perfectionlearning.com/lti/'
    };

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

    // Set LTI API URL for correct environment. Used by api/models/bookshelf/bookshelf-model.ts.
    if (/^(test|qa\d)/.test(w)) {
      API.LTI_BASE = lti_map.test;
    } else {
      API.LTI_BASE = lti_map.live;
    }

    API.appendTransform = function(transform) {
      var defaults = $http.defaults.transformResponse;
      defaults = angular.isArray(defaults) ? defaults : [defaults];
      return defaults.concat(transform);
    };

    return API;

  };
