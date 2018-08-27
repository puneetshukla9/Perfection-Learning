'use strict';

var template = require('./book-reader-layout.html');

export default function() {
    return {
  		restrict: 'E',
  		templateUrl: template,
  		replace: true
  	};

};
