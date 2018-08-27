'use strict';

//import './search-filter.less';
import dropdownController from './school-dropdown-controller.ts';
import dropdownDirective from './school-dropdown-directive.ts';

export default angular.module('admin.schooldropdown', [])
	.directive('schooldropdown', dropdownDirective)
	.controller('SchoolDropdownController', dropdownController);
