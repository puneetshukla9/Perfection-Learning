'use strict';

export default function(StudentHelper, License, CourseHelper, User, $http, SchoolHelper, Course, API) {

    var Student = {};

    Student.all = function() {
      var url = API.BASE + 'admin/district/students/all';
      return $http.get(url, { transformResponse: API.appendTransform(StudentHelper.transform) }).then(StudentHelper.save);
    };

    Student.getForSchool = function() { // called by a school admin
      var url = API.BASE + 'admin/students';
      return $http.get(url, { transformResponse: API.appendTransform(StudentHelper.transform) }).then(StudentHelper.save);
    };

    Student.getBySchoolRoster = function(schoolId) {
      // schoolId = (typeof(schoolId) === 'object' ? null : schoolId); // enables chaining
      var url = API.BASE + 'admin/school/students/all/school/' + schoolId;
      return $http.get(url, { transformResponse: API.appendTransform(StudentHelper.transform) }).then(SchoolHelper.saveStudents);
    };


    // userLevels - {usertypes: [ user levels in integers ] }

    Student.getUsersBySchool = function(userLevels) {
      var url = API.BASE + 'admin/users/school/all'; //+'/id/610';
      return $http.put(url, userLevels);
    };

    Student.getBySchool = function(schoolId) {
      // schoolId = (typeof(schoolId) === 'object' ? null : schoolId); // enables chaining
      var url = API.BASE + 'admin/school/students/all/school/' + schoolId;
      return $http.get(url, { transformResponse: API.appendTransform(StudentHelper.transform) }).then(StudentHelper.save);
    };

    Student.del = function(data) {
      return User.del(data).then(Student.getForSchool);
    };

    Student.getAllCourses = function(id) {
      var url;
      url = API.BASE + 'admin/user/' + id + '/courses/all';
      return $http.get(url).then(CourseHelper.saveStudent);
    };

    Student.getByDistrict = function() {
      var url;
      url = API.BASE + 'admin/district/students/all';
      return $http.get(url, { transformResponse: API.appendTransform(StudentHelper.transform) }).then(StudentHelper.save);
    };

    // only individual (should have bulk)
    Student.addToCourse = function(id, courseId, unitId) {
      var url;
      if (unitId) {
        url = API.BASE + 'admin/course/' + courseId + '/student/' + id + '/unit/' + unitId;
      } else {
        url = API.BASE + 'admin/course/' + courseId + '/student/' + id;
      } //.then(Student.getForSchool)
      return $http.put(url).then(User.all).then(Course.all).then(License.getAllLicenses);
    };

    // why doesn't the API support unitId here as before?
    Student.removeFromCourse = function(id, courseId) {
      var url;
      url = API.BASE + 'admin/course/' + courseId + '/student/' + id;
      return $http.delete(url).then(Student.getForSchool).then(Course.all).then(License.getAllLicenses);
    };

    return Student;

  };
