'use strict';

export default function(Bookshelf, State, AppState, $state, $stateParams) {
  var userid = AppState.get('user_id');
  var authtoken = AppState.get('ebooksAuthToken');
  var ebooksData = AppState.get('ebooksData');
//  var courseId = AppState.get('curCourse').id;
  var courseId = parseInt($stateParams.id, 10);
  var courseFiltered = AppState.get('courses').filter((item) => { return item.id === courseId; });
  var course = courseFiltered.length > 0 ? courseFiltered[0] : {};
  var courseBookId = parseInt(course.book_id, 10);
  var productLine = course.product_line;
  // State.bookshelf-school is set by the call to lti/school_licensed_books
  var schoolBooks = ebooksData.schoolLicensedBooks;
  var userBooks = ebooksData.userBookshelf.books;
  console.log('schoolBooks', schoolBooks);
  console.log('userBooks', userBooks);
//  var schoolBooks = State.get('bookshelf-school');
//  var userBooks = State.get('bookshelf');
  // Create a hash of userBooks.
  if (userBooks) {
    var userBookshelf = {};
    userBooks.forEach(item => {
      userBookshelf[item.book_id] = item;
    });
  }

  /*
  Expected sort order:
  1. Books belonging to this course: productLine matches.
     Alphabetize by title.
  2. Books belonging to school.
     Alphabetize by title.
  */
  function sortCourseBooks(a, b) {
    var result;
    if (a.belongsToCourse && !b.belongsToCourse) {
      result = -1;
    } else if (!a.belongsToCourse && b.belongsToCourse) {
      result = 1;
    } else {
      if (a.book_name < b.book_name) {
        result = -1;
      } else {
        result = 1;
      }
    }
    return result;
  }

  function getBooksInCollections(books) {
    // If this is a collection, get list of books belonging to it.
    var collectionBooks = {};
    books.forEach((book) => {
      if (book.collection && book.collection.length > 0) {
        collectionBooks[book.book_id] = [];
        book.collection.forEach((item) => {
          var collectionBook = JSON.parse(JSON.stringify(userBookshelf[item.book_id]));
          collectionBook.book_name = item.book_name;
          collectionBooks[book.book_id].push(collectionBook);
        });
      }
    });
    return collectionBooks;
  }

  /*
  The books parameter is payload from the call to lti/course_books/get.
  First, get an array of the book_id values from this payload. These are the books that belong to the course.
  Then, use the course's book_id to filter the books from lti/school_licensed_books. These are the books
  the school has access to that pertain to the product for which the class was created.
  Loop through the resulting list of courseBooks, and mark each one that the class is already using.
  Return the resulting list to be assigned to the controller bookshelf, for display.
  */
  function createBookshelf(books) {
    var collectionBooks = getBooksInCollections(books);
    var bookIds = books.map(item => item.book_id);
    var courseBooks = [];
    var nonCourseBooks = [];
    schoolBooks.forEach((book, ndx) => {
      //if (!userBookshelf[book.book_id]) return;
      //book.thumbUrl = userBookshelf[book.book_id] ? userBookshelf[book.book_id].thumbUrl : '';
      // Compile list of books specifically for this course. Each is also checked to see if the user's bookshelf contains it.
      if (courseBookId === parseInt(book.book_id, 10)) {
        if (collectionBooks[book.book_id]) {
          // If this "book" represents a collection, check each item in the collection
          // to see if it's in the user bookshelf array.
          collectionBooks[book.book_id].forEach((collectionBook) => {
            if (userBookshelf[collectionBook.book_id]) {
              collectionBook.belongsToCourse = true;
              // Thumbnail *may not* be getting included, so adding from userBookshelf.
              // NOTE: Currently, no evidence that it's not being included. This is a
              // pre-emptive measure. If we run into an account that uses this logic, we
              // should review to see if adding the thumbUrl is necessary.
              collectionBook.thumbUrl = userBookshelf[collectionBook.book_id].thumbUrl;
              courseBooks.push(collectionBook);
            }
          });
        } else {
          // Not a collection? Need to check to see if it's in the user bookshelf array.
          if (userBookshelf[book.book_id]) {
            book.belongsToCourse = true;
            // Thumbnail wasn't getting included, so adding from userBookshelf.
            book.thumbUrl = userBookshelf[book.book_id].thumbUrl;
            courseBooks.push(book);
          }
        }
      } else {
      // Compile a list of books that don't specifically belong to this course but that the teacher has discretion to add.
        if (bookIds.indexOf(book.book_id) !== -1) {
          book.inUse = true; // turns on or off the checkmark on the book.
        }
        // Necessary to check user bookshelf array to make sure the user has access.
        // (Is this a redundant check?)
        if (userBookshelf[book.book_id]) {
          book.thumbUrl = userBookshelf[book.book_id].thumbUrl;
          nonCourseBooks.push(book);
        }
      }
    });
    var bookshelf = {
      courseBooks: courseBooks,
      nonCourseBooks: nonCourseBooks
    };

    return bookshelf;
  }

  this.name = course.name;
  // Bookshelf.course calls lti/course_books/get
  Bookshelf.course(courseId).then(res => {
    var bookshelf = createBookshelf(res);
    bookshelf.courseBooks = bookshelf.courseBooks.sort(sortCourseBooks);
    bookshelf.nonCourseBooks = bookshelf.nonCourseBooks.sort(sortCourseBooks);
    this.courseBooks = bookshelf.courseBooks;
    this.nonCourseBooks = bookshelf.nonCourseBooks;
  });

  this.toggleSelect = (bookObj) => {
    var books = [bookObj.book_id];
    if (bookObj.inUse) {
      var promise = Bookshelf.removeFromCourse(courseId, books);
    } else {
      var promise = Bookshelf.addToCourse(courseId, books);
    }
    promise.then((res) => {
      this.nonCourseBooks.forEach((item, ndx) => {
        if (item.book_id === bookObj.book_id) {
          this.nonCourseBooks[ndx].inUse = !this.nonCourseBooks[ndx].inUse;
        }
      });
    });
  };
};
