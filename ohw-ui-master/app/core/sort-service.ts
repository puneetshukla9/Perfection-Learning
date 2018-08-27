'use strict';

export default function() {

	// Object Sort factory

	function keySort(field) {
		return function(a, b) {
			return sort(a[field], b[field]);
		};
	}


	// Numerical sort of string-based numbers, taking a lack
	// of preceding zeroes into account.
	//
	// This is failing for non-numeric values (as expected, given the description)
	//
	// There must be a more efficient way to do this!

	var num_re = /\d+/g;
	function sort(a, b) {
		// Extract numbers
		var nums_a = a.match(num_re);
		var nums_b = b.match(num_re);

		// No numbers -- string sort
		if (!nums_a || !nums_b) {
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}

		// Different primary values -- number sort
		if (nums_a[0] !== nums_b[0])
			return nums_a[0] - nums_b[0];

		// Equal primary, check on secondary
		if (nums_a.length >= 2 && nums_b.length >= 2)
			return nums_a[1] - nums_b[1];

		if (a < b) return -1;
		if (b < a) return 1;

		// Just give up. There are either no secondaries, or they are equal. We don't need to go any deeper.
		return 0;
	}


	// Public API

	return {
		sort: sort,
		keySort: keySort
	};

};
