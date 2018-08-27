'use strict';

export default function(State, $cacheFactory) {

    var AdminHelper = {};

    AdminHelper.transform = function(data) {
      var originalResponse = data;
      data = data.data;
      if (!(data instanceof Array)) return originalResponse;
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          data[key].name = data[key].first + ' ' + data[key].last;
        }
      }
      originalResponse.data = data;
      return originalResponse;
    };

    AdminHelper.clearCache = function(url) {
      var $httpDefaultCache = $cacheFactory.get('$http');
      $httpDefaultCache.remove(url);
    };

    AdminHelper.save = function(res) {
      var data = _.has(res, 'data') ? res.data : res || [];
      State.set('administrators', data);
      return data;
    };

    return AdminHelper;

};
