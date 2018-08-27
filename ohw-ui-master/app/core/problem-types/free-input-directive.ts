'use strict';

export default function() {
	// Searches for free input boxes
	// Tags inside the <maction> can be either <mtext> if there's no VTP inside, or <mn> if the
	// value is VTPed. That is weird and inconsistent. We probably want <mn> in all cases for
	// proper display.

	var regex = /<maction[^>]*>(<mtext>|<mn[^>]*>)*(.+?)(<\/mtext>|<\/mn>)*<\/maction>/g;
	// Replacement when we don't want to display the answer
	var replaceHidden = '<menclose class="placeholder" notation="box"><mspace height="18px" width="40px" /></menclose>';
	// Show the answer when there are multiple input boxes
	var replaceVisibleMany = '<menclose notation="box"><mn>$2</mn></menclose>';
	// Show the answer when there is one input boxes -- drop the surrounding box
	var replaceVisibleOne =  '<mn>$2</mn>';

	function formatHidden(str)	{
		return str.replace(regex, replaceHidden);
	}

	function formatVisible(str)	{
		// Find out how many input boxes there are
		var match = str.match(regex);
		if (match && match.length > 1) {
			return str.replace(regex, replaceVisibleMany);
		} else {
			return str.replace(regex, replaceVisibleOne);
		}
	}

	return {
		restrict: 'E',
		scope: { model: '=fiData'},
		link: function(scope, element, attrs) {
			var output;
			if (attrs.fiMode === 'hidden') {
				output = formatHidden(scope.model);
			} else {
				output = formatVisible(scope.model);
			}
			element.html(output);
		}
	};

};
