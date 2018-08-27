'use strict';


// Resets the scroll position of an element on request.
//
// When switching views or applying filters/data changes to ngRepeats, the scroll position
// will stay the same by default. That is almost always undesirable.
//
// This solution comes from:
//   http://stackoverflow.com/questions/24040985/scroll-to-top-of-div-in-angularjs
//
// Modified to use PubSub instead of $scope broadcasts.
//
// USAGE:
//   Template: <div id="myList" scroll-to-top-when="items_changed">

export default function(PubSub, $timeout) {



	function link (scope, element, attrs) {
		PubSub.subscribe(attrs.scrollToTopWhen, function() {
//			$timeout(function() {
				angular.element(element)[0].scrollTop = 0;
//			});
		});
	}


	// Configuration Block

	return {
		restrict: 'A',
		link: link
	};
};
