'use strict';

export default function() {
  	return {
  		restrict: 'E',

  		templateUrl: '/app/modules/admin/components/school-dropdown/schooldropdown.html',
  		controller: 'SchoolDropdownController as ctrl',
  		replace: true,
  		link: function(scope, el, attr) {
        scope.showLabel = attr.showLabel === 'true';
      }
  	};
  };
