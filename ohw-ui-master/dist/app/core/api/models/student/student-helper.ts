'use strict';

export default function(State) {

    var StudentHelper = {};

    StudentHelper.transform = function(data) {
      var originalResponse = data;
      data = data.data;
      if (!(data instanceof Array)) return originalResponse;
      for (var index in data) {
    		data[index].name = data[index].first + ' ' + data[index].last;
    		data[index].password = '*****';
	    }
  		var result = _.uniq(data, function(data) { return data.user_id; });
      originalResponse.data = result;
      return originalResponse;
    };

    StudentHelper.save = function(res) {
      var data = _.has(res, 'data') ? res.data : res || [];
      State.set('students', data);
      return data;
    };

    return StudentHelper;

};
