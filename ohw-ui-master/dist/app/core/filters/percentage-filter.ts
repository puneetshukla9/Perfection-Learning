'use strict';


// Filter to display a decimal value as a percentage

export default function($filter) {
	return function (input, decimals) {
		decimals = decimals || 0;
		return $filter('number')(input * 100, decimals) + '%';
	};
};
