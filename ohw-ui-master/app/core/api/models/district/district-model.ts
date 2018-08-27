'use strict';

export default function($http, API, State, PubSub) {

  var District;

  District.get = function() {
    var url = API.BASE + 'admin/get/district';
    return $http.get(url);
  };

  District.getLicenses = function() {
    var url = API.BASE + 'admin/district/licenses/list';
    return $http.get(url);
  };

  return District;

};
