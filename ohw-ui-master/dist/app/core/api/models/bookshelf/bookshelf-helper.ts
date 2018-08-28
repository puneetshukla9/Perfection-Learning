'use strict';

export default function(State, $cacheFactory) {

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
      return data;
    };

    return BookshelfHelper;
};
