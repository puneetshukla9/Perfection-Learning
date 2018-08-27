'use strict';

// Filter Bar Directive
//
// This was setup to allow for arbitrary items in pulldown lists.
// Unfortunately, some of the content interactions are complex, so there's a large amount
// of content-specific code.
// This could be cleaned up by splitting it into two pieces: a generic list-based directive
// and a smart data provider that contains the business logic.

export default function() {
	var template = require('./filter-bar.html');
	return {
		restrict: 'E',
		scope: {
			type1: '@',
			type2: '@'
		},
		controller: 'FilterBarCtrl as ctrl',
		bindTo: true,
		replace: true,
		templateUrl: template
	};
};
