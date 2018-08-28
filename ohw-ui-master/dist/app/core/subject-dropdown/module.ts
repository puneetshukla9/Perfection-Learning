'use strict';

import subjectDropdown from './subject-dropdown-directive.ts';
import subjectDropdownService from './subject-dropdown-service.ts';
import './subject-dropdown.less';
export default angular.module('core.subjectdropdown', [])
  .service('subjectDropdownService', subjectDropdownService)
  .directive('subjectDropdown', subjectDropdown);
