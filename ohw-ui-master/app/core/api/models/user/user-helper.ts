'use strict';

export default function(State) {

    var UserHelper = {};
    var reDateTime = /(\d{0,2}\/\d{0,2}\/\d{0,2})\s+(\d{0,2}:\d{0,2})/;

    UserHelper.transform = function(data) {
      var originalResponse = data;
      data = data.data;
      if (!(data instanceof Array)) return originalResponse;
      var administrators = [], teachers = [], students = [];
  		var uniqueUsers = _.uniq(data, function(data) { return data.user_id; });
  		for (var key in uniqueUsers) {
    		uniqueUsers[key].name = uniqueUsers[key].first + ' ' + uniqueUsers[key].last;
  			if (uniqueUsers[key].type === 'teacher' || uniqueUsers[key].type === 'ta') {
    			teachers.push(uniqueUsers[key]);
    		} else if (uniqueUsers[key].type === 'student') {
    			students.push(uniqueUsers[key]);
    		} else if (uniqueUsers[key].type === 'school admin') {
    			administrators.push(uniqueUsers[key]);
					teachers.push(uniqueUsers[key]);
				} else if (uniqueUsers[key].type === 'district admin') {
    			administrators.push(uniqueUsers[key]);
    		}
	    }
      var result = { students: students, teachers: teachers, administrators: administrators };
      originalResponse = result;
      return originalResponse;
    };

    UserHelper.transformUserInfo = function(data) {
      try {
        data.data.licenses.forEach((item) => {
          let result = reDateTime.exec(item.ub_expire_date);
          if (result) {
            item.ub_expire_date = result[1];
          }
        });
      } catch (e) {
        // In case data.data.licenses is missing or isn't an array.
      }

      return data;
    };

    UserHelper.save = function(res) {
      var data = _.has(res, 'data') ? res.data : res || [];
  		State.set('students', data.students);
  		State.set('teachers', data.teachers);
  		State.set('administrators', data.administrators);
      return data;
    };

    UserHelper.plcSave = function(res) {
      var data = _.has(res, 'data') ? res.data : res || [];
      State.set('plcUsers', data);
      return data;
    };

    return UserHelper;

};
