'use strict';

// Performs MathJax conversion
//
// It was fully automatic, but that was TOO SLOW.
// Manual requests occasionally failed due to digest unpredictability.
// This method is mostly automatic, but it can only jax items inside ngRepeat blocks.
// That works for now, but in general is a poor limitation.

// This must be included in an ngRepeat block to cause
// jaxing to occur.
export default function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			if (scope.$last) scope.$emit('jaxIt');
		}
	};
};
