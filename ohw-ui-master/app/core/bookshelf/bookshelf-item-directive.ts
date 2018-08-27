'use strict';

var template = require('./bookshelf.html');

export default function() {
    var lastBookBelongedToCourse = true;

    return {
  		restrict: 'E',
  		templateUrl: template,
  		replace: true,
      scope: {
        book: '=ngModel',
        classid: '=classid',
        ctrlFn: '&',
        toggleFn: '&'
      },
      link: function(scope, element, attrs) {
        if (lastBookBelongedToCourse && !scope.book.belongsToCourse) {
          scope.shelfTransition = true;
          lastBookBelongedToCourse = false;
        }
        scope.bookSelected = true;

        scope.fireToggleSelect = () => {
          scope.toggleFn({data: scope.book});
        };

  		}

  	};

};
