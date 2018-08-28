'use strict';

import userBookshelf from './user-bookshelf-controller';
import readBook from './book-read-controller';
import './bookshelf-layout.less';

export default angular.module('digitalLibrary.bookshelf', [])
  .controller('BookReadCtrl', readBook)
  .controller('UserBookshelfCtrl', userBookshelf);
