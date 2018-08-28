'use strict';

export default function(Bookshelf, State, AppState, $state, $stateParams) {
  var userid = AppState.get('user_id');
  var authtoken = AppState.get('ebooksAuthToken');
  var bookId = $stateParams.bookId;
  /*
    Get the book's title. The userBookshelf was loaded previously, but that was in the original tab.
  */
  /*
  Bookshelf.userBookshelf(userid, authtoken).then(res => {
    var matchingBooks = res.filter(book => book.book_id === bookId);
    if (matchingBooks.length > 0) {
      console.log('userBookshelf, matchingBooks', matchingBooks);
      this.name = matchingBooks[0].title;
      this.productLine = matchingBooks[0].product_line;
      document.getElementsByClassName('subject-dropdown')[0].innerHTML = matchingBooks[0].title;
    }
  });
*/
  /*
    This bit gets the book's URL and loads it into the container for reading. Currently, that container
    is an iframe.
  */
  Bookshelf.launch(userid, authtoken, bookId).then(data => {
    console.log('Bookshelf.launch data', data);
    // This condition is temporary, pending Hurix resolution to CORS iframes issue.
    if (/kitaboo\.com/.test(data.readerurl)) {
      // Launch book URL directly, bypassing iframe.
      console.log('kitaboo reader', data.readerurl);
      document.location = data.readerurl;
    } else if (bookId === '66') {
      console.log('Custom FPP reader', data.readerurl);
      document.location = data.readerurl;
    } else {
      // Launch book in iframe.
      console.log('not kitaboo or FPP reader', data.readerurl);
      this.url = data.readerurl;
    }
  });
};
