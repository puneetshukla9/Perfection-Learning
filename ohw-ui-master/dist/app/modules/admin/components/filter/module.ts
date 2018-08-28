'use strict';

import filtersController from './filter-controller.ts';
import filterDirective from './filter-directive.ts';
import filterFactory from './filter-factory.ts';

export default angular.module('admin.filter', [])
	.directive('filters', filterDirective)
	.controller('FiltersController', filtersController)
	.constant('kbAdminFiltersPath', {
		path: 'filter/'
	});
