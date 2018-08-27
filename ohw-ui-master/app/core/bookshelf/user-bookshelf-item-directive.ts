'use strict';

var template = require('./user-bookshelf.html');

export default function() {

    return {
  		restrict: 'E',
  		templateUrl: template,
  		replace: true,
      scope: {
        book: '=ngModel',
        classid: '=classid',
        ctrlFn: '&'
      },
      link: function(scope, element, attrs) {
        scope.fireLaunch = () => {
          var data = scope.book;
          scope.ctrlFn({data: data.book_id});
        };
  		}
    };
};
