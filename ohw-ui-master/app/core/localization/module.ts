'use strict';

var defs = require('./../../../config/api.json');

export default angular.module('core.localization', [])

  .run(function(Localization) {
  	Localization.set('api', defs);
  })

  .factory('Localization', function() {

    var Localization = {};

    Localization.data = {};

    // todo: support deep keys
    Localization.get = function(module, key, subkey) {
      try {
        if (subkey) {
          return Localization.data[module][key][subkey];
	  	} else {
          return Localization.data[module][key];
	    }
      } catch (e) {
        return false;
      }
    };

    Localization.set = function(module, data) {
      Localization.data[module] = data;
    };

    return Localization;

  });
