'use strict';

export default function(Bookshelf, State, AppState, $state, $stateParams) {
  var userid = AppState.get('user_id');
  var ebooksData = AppState.get('ebooksData');
  var authtoken = AppState.get('ebooksAuthToken');
  var bookshelf = ebooksData.bookshelf; // Use the bookshelf flags from ebooksData, which take into account userBookshelf.
  var isIHDP = !!bookshelf.pdf;
//  var courseId = AppState.get('curCourse').id;
  var courseId = parseInt($stateParams.id, 10);
  var courseFiltered = AppState.get('courses').filter((item) => { return item.id === courseId; });
  var course = courseFiltered.length > 0 ? courseFiltered[0] : {};
  var productLine = course.product_line;
  // State.bookshelf-school is set by the call to lti/school_licensed_books
  var schoolBooks = State.get('bookshelf-school');

  var defaultSectionName = 'Additional Titles Available';
  /*
   Use this to sort the books and divide them into sections.
   It adds a 'section' property to each book, so that the template
   can detect a new section and label it.
  */
  function getBookSorter(property) {
    return function(a, b) {
      var result = 0;
      // !b[property]: if b[property] is null, put a first. This sets up to put default section last.
      if (!b[property]) {
        result = -1;
      } else if (!a[property]) {
        result = 1;
      } else if (a[property] < b[property]) {
        result = -1;
        // !a[property]: if a[property] is null, put b first.
      } else if (a[property] > b[property]) {
        result = 1;
      } else {
        // a[property] and b[property] are the same. title is secondary sort.
        result = a.title < b.title ? -1 : 1;
      }
      return result;
    };
  }

  // Need to work with book copy when making a new instance for each class. This is quicker than _.cloneDeep.
  function copyBook(book) {
    var _book = {
      book_id: book.book_id,
      title: book.title,
      category: book.category,
      collection: book.collection,
      product_line: book.product_line,
      thumbUrl: book.thumbUrl
    };
    return _book;
  }

  // Organize the books to display for a class. These are not broken down by section.
  function organizeBooks(books) {
    var sectionLabel = 'Category ';
    //var sectionProperty = 'category';
    var sectionProperty = isIHDP ? 'className' : 'collection';
    var _books = [];

    if (isIHDP) {
      // Build a class-organized list of books if the sectionProperty is className. Otherwise, we skip this bit.
      books.forEach((book, ndx) => {
        // If a book lacks a category, it's probably because it's part of a collection, in which case it
        // should be organized by collection name.
        if (!book.category) books[ndx].category = book.collection;
        if (book.classes.length === 0) { book.classes = [{ name: 'Additional Titles Available' }]; }
        book.classes.forEach(c => {
          var _book = copyBook(books[ndx]);
          _book.className = c.name;
          _books.push(_book); // allows the same book in each of possibly multiple classes.
        });
      });
      books = _books; // point books at newly created _books array.
    }

    var lastItem = '';
    // For now, omit the sort, as this is handled on the server.
    //books.sort(getBookSorter(sectionProperty));
    books.forEach((item, ndx) => {
      if (item[sectionProperty] !== lastItem) {
        books[ndx].section = sectionLabel + item[sectionProperty];
        lastItem = item[sectionProperty];
      }
    });
    return books;

  }

  // Create array of sections, each with its bookshelf, for displaying the user's bookshelf.
  // With the new plan of organizing books by class, set the sectionProperty to className.
  function organizeSections(books) {
    var sections = [];
    var section = null;
    var sectionLabel = '';
    var sectionProperty = isIHDP ? 'className' : 'collection';
    var lastItem = '';
    books.sort(getBookSorter(sectionProperty));

    books.forEach((item, ndx) => {
      if (item[sectionProperty] !== lastItem) {
        if (section) {
          sections.push(section);
        }
        let sectionName = item[sectionProperty] ? sectionLabel + item[sectionProperty] : defaultSectionName;
        section = {
          name: sectionName,
          bookshelf: [item]
        };
        lastItem = item[sectionProperty];
      } else {
        section.bookshelf.push(item);
      }
    });
    sections.push(section);

    return sections;
  }

  // The intention here is to check for books that belong to a collection and add the collection.
  // The new plan is to organize books by class. Accordingly, eliminate any books that don't belong to a class.
  // UPDATE: Why are we eliminating books with no classes? Let's remove that condition and see what happens.
  function prepBooks(books) {
    var prepped = [];
    books.forEach((item, ndx) => {
      if (item.collectionBookId) {
        item.category = item.collection;
      }
      prepped.push(item);
    });
    return prepped;
  }

  this.name = 'Teacher';
  var books = AppState.get('ebooksData').userBookshelf.books;
  var preppedBooks = prepBooks(books);
  this.bookshelf = organizeBooks(preppedBooks);   // bookshelf is for a class.
  this.sections = organizeSections(this.bookshelf); // sections is for a user. Consider how to consolidate.
/*
  Bookshelf.userBookshelf(userid, authtoken).then(res => {
    var preppedBooks = prepBooks(res);
    this.bookshelf = organizeBooks(preppedBooks);   // bookshelf is for a class.
    this.sections = organizeSections(preppedBooks); // sections is for a user. Consider how to consolidate.
  });
*/

  this.launch = (bookId) => {
    // Go back to opening book from our own domain, to deal with popup blocker issue.
    // This might still be too expensive in load time. If so, will need to reassess.
    var win = window.open('./digital-library/index.html', '_blank');
//    var url = '/digital-library/read/' + bookId;
//    window.open(url, '_blank');

    var book = books.filter(b => { return b.book_id === bookId; } );
    book = book.length > 0 ? book[0] : {};
    if (book.product_line === 'ihdp') {
      // For IHDP books, we want to continue to use our own URL. One reason for this is that the directory in which the books are
      // stored is unprotected, so we want to keep that concealed for the present.
      // In doing this, we are accepting a greater load time.
      var url = '/digital-library/read/' + bookId;
      //window.open(url, '_blank');
      win.location.href = url;
    } else {
      // Get book URL from already loaded teacher app, and open directly in new tab.
      // This deprives us of our digital-library/read URL for IHDP books. If that's a problem,
      // we'll need another approach. However, the advantage is a faster loading time for the teacher.
      Bookshelf.launch(userid, authtoken, bookId).then(data => {
        if (data.readerurl) {
          //window.open(data.readerurl, '_blank');
          win.location.href = data.readerurl;
        }
      });
    }

    //$state.go('adminApp.bookshelf.bookRead', { bookId: bookId });
  };
};
