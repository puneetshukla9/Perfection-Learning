'use strict';

export default function(Config, User, TeacherUploadValidation) {

    var Generate = {};

    Generate.removeAccents = (str) => {
      if (!_.has(str, 'length') || !str.length) return str;
      _.each(Config.diacriticsMap, function(diacritic, i) {
        str = str.replace(diacritic, i);
      });
      return str;
  	};

    Generate.username = function(type, value, row) {
      var first = Generate.removeAccents(row['first name']);
      var last = Generate.removeAccents(row['last name']);
      return ((first || '') + (last || '')).toLowerCase();
    };

    return Generate;

  };
