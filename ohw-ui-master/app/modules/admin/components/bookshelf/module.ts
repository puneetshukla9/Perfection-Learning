'use strict';

import bookshelf from './bookshelf-controller';
import './bookshelf-layout.less';

export default angular.module('admin.bookshelf', [])
  .controller('BookshelfCtrl', bookshelf);
