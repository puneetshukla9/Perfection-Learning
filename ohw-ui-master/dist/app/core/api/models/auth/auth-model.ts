'use strict';

export default function($http, User, API, State, PubSub) {

  var Auth = {};

  Auth.get = function() {
    var url;
    url = API.REST_BASE + 'users/status';
    return $http.get(url);
  };

  Auth.logout = function() {
    var url = API.REST_BASE + 'users/logout';
    return $http.get(url);
  };

  return Auth;

};
