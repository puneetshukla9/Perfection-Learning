'use strict';

export default function() {
	var template = require('./kb-svg-filters.html');
	// This was used to overcome an Angular bug.
	// The template transpiler can't handle <stop> tags with
	// child nodes. We need to manually insert them.
	//
	// The current version of the filters isn't using <stop> tags
	// with children, so this is disabled until needed.
	function link(scope, element, attrs) {
//		var test = element.find('stop');
//		test[0].innerHTML = '<animate attributeName="stop-color" values="yellow;red" dur="3s" repeatCount="indefinite"></animate>';
//		test[1].innerHTML = '<animate attributeName="stop-color" values="red;yellow" dur="3s" repeatCount="indefinite"></animate>';

//		test[1].innerHTML = '<animate attributeName="offset" from="0" to="1" dur="3s" repeatCount="indefinite"></animate>';
//		test[2].innerHTML = '<animate attributeName="offset" from="0.1" to="1.1" dur="3s" repeatCount="indefinite"></animate>';
//		test[3].innerHTML = '<animate attributeName="offset" from="0.2" to="1.2" dur="3s" repeatCount="indefinite"></animate>';
	}

// Directive configuration
	return {
		restrict: 'E',
		templateUrl: template,
		replace: true
//		link: link
	};
};
