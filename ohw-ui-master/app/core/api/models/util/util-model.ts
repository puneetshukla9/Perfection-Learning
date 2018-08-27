'use strict';

import { MassageBootstrap } from './../../../process-bootstrap-service.ts';

export default function($http, API, State, PubSub) {

  var Util = {};
  var massageBootstrap = new MassageBootstrap();

  Util.getAllPrefs = function() {
    var url;
    url = API.BASE + 'prefs';
    return $http.get(url);
  };

  Util.getPrefs = function(category) {
    var url;
    url = API.BASE + 'prefs/category/' + category;
    return $http.get(url);
  };

  Util.setPrefs = function(payload) {
    var url = API.BASE + 'prefs/save';
    return $http.post(url, payload);
  };

  Util.convertDateStrToInt = function(dateStr) {
    if (dateStr) {
      var dateArr = dateStr.split('/');
      if (dateArr.length === 3) {
        var year = dateArr[2];
        var out = year + dateArr[0] + dateArr[1];
        return +out;
      }
    }
    return null;
  };

  Util.convertIsoDateStrToInt = function(dateStr) {
    if (dateStr) {
      var out = dateStr.split('-').join('');
      return +out;
    }
    return null;
  };

  Util.cache = function(bool) {
    bool = !!bool;
    var url = API.BASE + 'output/caching/set';
    return $http.put(url, { enable_cache: bool });
  };

  Util.wrap = function(bool) {
    bool = !!bool;
    var url = API.BASE + 'output/wrapping/set';
    return $http.put(url, { wrap_output: bool });
  };

  Util.getBootstrap = function() {
    return $http.get(API.BASE + 'bootstrap', { cache: false }).then(massageBootstrap.process);
  };

  return Util;

};
