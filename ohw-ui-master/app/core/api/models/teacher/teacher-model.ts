'use strict';

export default function($http, TeacherHelper, User, API, State, PubSub) {

  var Teacher = {};

  Teacher.all = function() {
    var url;
    url = API.BASE + 'admin/district/teachers/all';
    return $http.get(url, {
      transformResponse: API.appendTransform(TeacherHelper.transform) }).then(TeacherHelper.save);
  };

  Teacher.getById = function(id) {
    var url;
    url = API.BASE + 'admin/district/teachers/all/teacher' + id;
    return $http.get(url, {
      transformResponse: API.appendTransform(TeacherHelper.transform) }).then(TeacherHelper.saveSchedule);
  };

  Teacher.getBySchoolRoster = function(schoolId) {
    var url;
    url = API.BASE + 'admin/school/teachers/all/school/' + schoolId;
    return $http.get(url, {
      transformResponse: API.appendTransform(TeacherHelper.transform) }).then(TeacherHelper.saveSchools);
  };

  Teacher.getBySchool = function(schoolId) {
    var url;
    url = API.BASE + 'admin/school/teachers/all/school/' + schoolId;
    return $http.get(url, {
      transformResponse: API.appendTransform(TeacherHelper.transform) }).then(TeacherHelper.save);
  };

  Teacher.removeFromCourse = function(courseId, payload) {
    var url;
    url = API.BASE + '/admin/users/drop/course/' + courseId + '/bulk';
    return $http.put(url, payload).then(Teacher.all);
  };

  Teacher.del = function(ids) {
    return User.del(ids).then(Teacher.all).then(TeacherHelper.save);
  };

  return Teacher;

};
