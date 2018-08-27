'use strict';

export default function () {
	return {
	  restrict: 'A',
	  link: {
		pre: function (scope, element, attr) {
		  var source, canPlay;
		  function changeSource() {
			element.attr('src', source);
		  }
		  scope.$watch(attr.videoSrc, function (newValue, oldValue) {
			if (!source || newValue !== oldValue) {
			  source = newValue;
			  if (source) changeSource();
			}
		  });
		}
	  }
	};
  }
