'use strict';

export default function($http, API, State, PubSub) {

  var TeacherHelper = {};

  TeacherHelper.transform = function(data) {
    var originalResponse = data;
    data = data.data;
    if (!(data instanceof Array)) return originalResponse;
		for (var index in data) {
  		data[index].name = data[index].first + ' ' + data[index].last;
	  }
    originalResponse.data = data;
    return originalResponse;
  };

  TeacherHelper.save = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    State.set('teachers', data);
    return data;
  };

  TeacherHelper.saveSchedule = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    State.set('teachersSchedule', data);
    return data;
  };

  TeacherHelper.saveSchools = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    State.set('schoolTeachers', data);
    return data;
  };

  TeacherHelper.genPwd = function(x = 8) {
    var ret = '';
    for (var j = 0; j < x; j++) {
      var chr = '';
      while (/[A-Za-z0-9]/.test(chr) === false) {
        var rnd = Math.ceil(Math.random() * 122);
        var chr = String.fromCharCode(rnd);
      }
      ret += chr;
    }

    return ret;
  };

  return TeacherHelper;

};
