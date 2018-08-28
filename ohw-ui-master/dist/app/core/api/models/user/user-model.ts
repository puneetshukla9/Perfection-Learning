'use strict';

export default function(UserHelper, License, $http, API, State, PubSub) {

  var User = {};

  User.get = function() {
    var payload = { usertypes: [1, 2, 3, 4, 5] };
    var url = API.BASE + 'admin/users/school/all';
    var config = _.extend({}, { transformResponse: API.appendTransform(UserHelper.transform) });
    return $http.put(url, payload, config).then(UserHelper.save);
  };

  User.getIndividual = function(userId) {
    var url = API.BASE + 'admin/user/' + userId + '/info';
    var config = _.extend({}, { cache: false, transformResponse: API.appendTransform(UserHelper.transformUserInfo) });
    return $http.get(url, config);
  };

  User.plcUserSearch = function(userSearch) {
    var url = API.BASE + 'plcadmin/users';
    var payload = { user_search: userSearch };
    return $http.put(url, payload).then(UserHelper.plcSave);
  };

  User.getClasses = function(products, config) {
    var url = API.BASE + 'admin/courses/school/all';
    return $http.put(url, products, config);
  };

  User.edit = function(userId, data, config) {
    var url = API.BASE + 'admin/user/' + userId;
    return $http.put(url, data, config).then(User.get);
  };

  User.editUsername = function(userId, username, config) {
		var payload = {
			'email': username
		};
    var url = API.BASE + 'admin/user/' + userId + '/email';
    return $http.put(url, payload, config).then(User.get);
  };

  User.create = function(data, config) {
    if (typeof(data) === 'string') {
      data.email = data.email.toLowerCase(); // email can't handle uppercase
    }
    var url = API.BASE + 'admin/user/create';
    return $http.post(url, data, config).then(User.get).then(License.getAllLicenses);
  };

  User.registerWithCode = function(payload, config) {
    //payload is email, pw and token (registration code)
    var url = API.LOGIN_BASE + 'users/register';

    return $http.post(url, payload, config);
  };

  User.del = function(payload, config) {
    // var payload = [];
		// for (var key in data) {
    //   payload.push(data[key].user_id);
    // }
    var url = API.BASE + 'admin/users/delete/bulk';
	  return $http.put(url, payload, config).then(License.getAllLicenses);
  };

  User.resetCodes = function(userIds, password, config) {
    var
      url = API.BASE + 'admin/password/reset/bulk',
      payload = [],
      key;
    if (!password) {
      for (key in userIds) {
         payload.push(userIds[key].user_id);
      }
    } else {
      for (key in userIds) {
        payload.push ({ user_id: userIds[key].user_id, password: password });
      }
    }
    return $http.put(url, payload, config);
  };

  User.resetPassword = function(userIds, password, config) {
    var
      url = API.BASE + '/admin/password/reset/bulk', //'admin/password/reset/bulk',
      payload = [],
      key;
    if (!password) {
      for (key in userIds) {
         payload.push(userIds[key].user_id);
      }
    } else {
      for (key in userIds) {
        payload.push ({ user_id: userIds[key].user_id, password: password });
      }
    }
    return $http.put(url, payload, config);
  };

  User.sendPwEmail = function (email, config) {
    var url = API.LOGIN_BASE + 'users/password/reset';

    var payload = {'email': email, 'admin_requested': 1};
    return $http.post(url, payload, config);
  };

  User.assignSchool = function(rows, schoolId, config) {
    if (!schoolId) throw new Error('School Id Required');
		var userIds = [], url;
		for (var key in rows) {
    	userIds.push(parseInt(rows[key].user_id, 10));
    }
		url = API.BASE + 'admin/users/school/' + schoolId + '/bulk';
		return $http.put(url, userIds, config);
  };

  User.assignUserToSchool = function(userId, schoolId, config) {
    var url = API.BASE + 'admin/users/school/' + schoolId + '/bulk';
		return $http.put(url, [userId], config);
  };

  User.addLicense = function(id, licenseId, config) {
    var url;
    url = API.BASE + 'admin/user/' + id + '/license/' + licenseId + '/add';
    return $http.put(url, {}, config);
  };

  // Deprecated
  // User.getMissingPasswords = function(userIds) {
  //   var url = API.BASE + 'admin/passwords/generated';
  //   return $http.put(url, userIds);
  // };

  User.editInfo = function(userId, data) {
    var url = API.BASE + 'admin/user/' + userId;
    return $http.put(url, data);
  };

  User.areEmailsTaken = function(emailArr) {
    var url = API.BASE + 'users/exists';
		return $http.put(url, emailArr);
  };

  User.checkStudentNum = function(studentNumArr) {
    var url = API.BASE + 'admin/student/num/exists';
    return $http.put(url, studentNumArr);
  };

  User.changeEmail = function(payload) {
    var url = API.REST_BASE + 'admin/user/email';
    return $http.put(url, payload);
  };

  User.changePassword = function(payload) {
    var url = API.REST_BASE + 'admin/user/password';
    return $http.put(url, payload);
  };

  return User;

};
