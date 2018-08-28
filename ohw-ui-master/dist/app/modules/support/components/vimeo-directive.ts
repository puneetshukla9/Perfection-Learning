'use strict';

import * as $ from 'jquery';

export default function () {
	return {
	  restrict: 'A',
		replace: false,
	  link: function(scope, elem, attrs) {
			var embedCode = scope.$eval(attrs.embedcode);
			var html = '<iframe src="https://player.vimeo.com/video/' +
						embedCode + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
			$(elem).html(html);
	  }
	};
  }
