'use strict';

// Natural sort: written for sorting assignment names. Idea is to left-pad numbers with 0s.
// Example: in an ordinary string sort, 10 comes before 2, which we don't want.
// If we pad with 0s, we get, for example, 002 and 010; and 002 will precede 010.
// Not worrying about numbers after function() {

export default function() {

	var fld;
	var pad = '00000000';

	function prepVal(rawVal) {
		// zero-pad first group of digits in string.
		var preppedVal = rawVal.replace(/(\d+)/, function(val) {
			return pad.substr(0, pad.length - val.length) + val;
		});
		return preppedVal;
	}

	function natSort(a, b) {
		var item1 = prepVal(a[fld]);
		var item2 = prepVal(b[fld]);
		return item1 < item2 ? -1 : 1;
	}

	return function(items, field) {
		fld = field;
		var nameList = [];
		if (items) {
			items.forEach(function(item) {
				nameList.push(item);
			});
		}
		nameList.sort(natSort);
		return nameList;
	};

};
