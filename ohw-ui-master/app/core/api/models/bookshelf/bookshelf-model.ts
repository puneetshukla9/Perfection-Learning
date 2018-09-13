'use strict';

export default function(API, BookshelfHelper, $http) {

  var Bookshelf = {};
  var BASE = API.LTI_BASE;

  // Get user's bookshelf contents.
  Bookshelf.userBookshelf = function(userid, authtoken) {
    var url = BASE + 'userBookshelf';
    var data = { userid: userid, authtoken: authtoken };
    return $http.post(url, data).then(BookshelfHelper.userBookshelf);
  };

  // Launch the book for reading.
  Bookshelf.launch = function(userid, authtoken, book_id) {
    var url = BASE + 'launchBook';
    var data = {
      userid: userid,
      authtoken: authtoken,
      book_id: book_id
    };
    return $http.post(url, data).then(BookshelfHelper.launch);
  };

  // Get all available Engage books.
  Bookshelf.all = function() {
    var url = BASE + 'all_engage_books';
    return $http.get(url).then(BookshelfHelper.all);
  };

  // Get all Engage books currently licensed to a school.
  Bookshelf.school = function(schoolId) {
    var url = BASE + 'school_licensed_books';
    var payload = { schoolId: schoolId };
    return $http.post(url, payload).then(BookshelfHelper.school);
  };

  // Get all Engage books currently assigned to a course.
  Bookshelf.course = function(courseId) {
    var url = BASE + 'course_books/get';
    var payload = { course_id: courseId };
    return $http.post(url, payload).then(BookshelfHelper.course);
  };

  // Add Engage books to a course.
  Bookshelf.addToCourse = function(courseId, books) {
    var url = BASE + 'course_books/add';
    var payload = { course_id: courseId, books: books };
    return $http.post(url, payload);
  };

  // Remove Engage books from a course.
  Bookshelf.removeFromCourse = function(courseId, books) {
    var url = BASE + 'course_books/remove';
    books = books.map(b => parseInt(b, 10));
    var payload = { course_id: courseId, books: books };
    return $http.post(url, payload);
  };

  // Remove a student from a class on the Kitaboo system so that the instructor of the class
  // doesn't see the student in the Statistics. This should be done after removing a student
  // from a course on the PL system.
  // NOTE: Parameters are supposed to be passed through the headers. Will need to test this.
  Bookshelf.removeStudent = function(courseId, studentId) {
    var url = BASE + 'removeUserFromClass';
    var payload = { course_id: courseId, books: books };
    return $http.delete(url, payload);
  };

  return Bookshelf;

};
