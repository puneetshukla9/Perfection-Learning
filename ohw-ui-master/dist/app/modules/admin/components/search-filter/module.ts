'use strict';

import './search-filter.less';
import filtersController from './search-filter-controller.ts';
import filterDirective from './search-filter-directive.ts';

export default angular.module('admin.searchfilter', [])
	.directive('searchfilter', filterDirective)
	.controller('FiltersController', filtersController);
