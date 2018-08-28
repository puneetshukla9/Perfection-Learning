'use strict';

// Manages a set of options, with broadcast on change

export default function() {

	var ctr = 0;
	return {
		get: function() {
			return '_' + (++ctr);
		}
	};

};
