'use strict';

export default function($http, AdminHelper, User, API, State, PubSub) {

  var Admin = {};

  Admin.get = function() {
    var url;
    url = API.BASE + 'admin/district/administrators/all';
    return $http.get(url, { transfomResponse: AdminHelper.transfom }).then(AdminHelper.save);
  };

  Admin.getBySchool = function(schoolId) {
    var url;
    url = API.BASE + 'admin/school/administrators/all/school/' + schoolId;
    return $http.get(url, { transfomResponse: AdminHelper.transfom }).then(AdminHelper.save);
  };

  Admin.del = function(ids) {
    return User.del(ids).then(Admin.get).then(AdminHelper.save);
  };

  return Admin;

};
