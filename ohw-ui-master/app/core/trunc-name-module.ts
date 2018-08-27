'use strict';


// Manages persistent preferences
export default function() {

	function trunc(name, maxLen) {
		if (typeof maxLen === 'undefined')
			maxLen = 20;

		if (name.length <= maxLen)
			return name;

		return name.substring(0, maxLen - 3) + '...';
	}


	return trunc;

};
