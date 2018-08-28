'use strict';

import bookReaderLayout from './book-reader-directive.ts';
import bookshelfItem from './bookshelf-item-directive.ts';
import userBookshelfItem from './user-bookshelf-item-directive.ts';
import './bookshelf.less';

export default angular.module('core.bookshelf', [])
  .directive('bookReaderLayout', bookReaderLayout)
	.directive('bookshelfItem', bookshelfItem)
  .directive('userBookshelfItem', userBookshelfItem);
