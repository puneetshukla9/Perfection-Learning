'use strict';


// Image with optional overlays
export default function() {

	function link(scope, element, attrs) {
		if (!scope.model)
			return;

		for (var i = 0, len = scope.model.length; i < len; i++) {
			scope.model[i].x = parseInt(scope.model[i].x, 10);	// + 3;
			scope.model[i].y = parseInt(scope.model[i].y, 10);	// + 3;
		}
	}

	return {
		restrict: 'E',

		scope: {
			model: '=qiData',
			src: '@ngSrc'
		},

		link: link,
		templateUrl: require('./q-image.html')
	};
};
