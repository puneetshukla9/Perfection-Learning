'use strict';

export default function(AppState, State, $cacheFactory) {

		var BookshelfHelper = {};

		BookshelfHelper.userBookshelf = (res) => {
       var data = _.has(res, 'data') ? res.data : res || [];
       var books = data.books || [];
       State.set('bookshelf', books);
       return books;
     };

     BookshelfHelper.launch = (res) => {
       var data = _.has(res, 'data') ? res.data : res || [];
       return data;
     };

    BookshelfHelper.all = (res) => {
      var data = _.has(res, 'data') ? res.data : res || [];
      console.log('BookshelfHelper.all data', data);
      return data;
    };

    BookshelfHelper.school = (res) => {
      var data = _.has(res, 'data') ? res.data : res || [];
      State.set('bookshelf-school', data);
      return data;
    };

    BookshelfHelper.course = (res) => {
      var data = _.has(res, 'data') ? res.data : res || [];
			// Get userBookshelf, to look up each book's possible collection ID and associate it with
			// that book in the course_books/get response payload.
			var ebooksData = AppState.get('ebooksData');
			var books = ebooksData.userBookshelf.books || [];
			data.forEach((b, ndx) => {
				var fromUserBookshelf = books.find(item => item.book_id === b.book_id);
				if (fromUserBookshelf && fromUserBookshelf.collection_book_id) {
					data[ndx].collection_id = fromUserBookshelf.collection_book_id;
				}
			});
      return data;
    };

    return BookshelfHelper;
};
