'use strict';

// Performs MathJax conversion
//
// It was fully automatic, but that was TOO SLOW.
// Manual requests occasionally failed due to digest unpredictability.
// This method is mostly automatic, but it can only jax items inside ngRepeat blocks.
// That works for now, but in general is a poor limitation.

export default function($timeout) {

	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			function show() {
				element.css('visibility', 'visible');
			}

			scope.$on('jaxIt', function () {
				// Hide the element during Jax conversion
				element.css('visibility', 'hidden');
				// We need to wait for the next digest cycle
				$timeout(() => {
					MathJax.Hub.Queue(['Typeset', MathJax.Hub, element[0], show]);
				}, 500);
    	});

		}

	};

};
