'use strict';

import * as $ from 'jquery';

export default function () {
	return {
	  restrict: 'A',
	  link: function(scope, elem, attrs) {
		var embedCode = scope.$eval(attrs.embedcode);
		var html = '<iframe width="400" height="300" src="https://www.youtube.com/embed/' +
				   embedCode + '" frameborder="0" allowfullscreen></iframe>';
		$(elem).html(html);
	  }
	};
  }
