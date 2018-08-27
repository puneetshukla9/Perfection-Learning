'use strict';

import percentage from './percentage-filter.ts';
import sort from './sort-filter.ts';

export default angular.module('core.filters', [])
	.filter('NatSort', sort)
	.filter('percentage', percentage);
