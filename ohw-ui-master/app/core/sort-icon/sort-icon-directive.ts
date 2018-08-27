'use strict';


// Sort icon with various states (unsorted, ascending, descending)
//
// Click handling is external (at present), under the assumption that the header text is also
// clickable.
// Consider moving the header text into this directive.

export default function() {

	var iconClasses = {
		unsorted: 'icon icon-caret-up-down',
		ascend: 'icon icon-caret-up',
		descend: 'icon icon-caret-down'
	};


	//

	function pickIcon(key, state) {
		if (state === key) {
			return iconClasses.ascend;
		} else if (state === ('-' + key)) {
			return iconClasses.descend;
		} else {
			return iconClasses.unsorted;
		}
	}



	function link(scope, element, attrs) {
		scope.pickIcon = pickIcon;
	}



	return {
		restrict: 'E',

		scope: {
			state: '=',
			key: '@'
		},

		link: link,
		templateUrl: require('./sort-icon.html')
	};
};
