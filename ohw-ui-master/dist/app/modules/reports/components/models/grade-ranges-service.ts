'use strict';

export default function() {

	var ranges = {
		excel: 90,
		pass: 70
	};

	function get(key) {
		return ranges;		// Hopefully we don't need to clone this.
	}

	// Public API
	return {
		get: get
	};

};
