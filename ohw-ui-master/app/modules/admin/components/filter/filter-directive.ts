'use strict';

export default function(kbAdminFiltersPath) {
  	return {
  		restrict: 'E',
  		scope: {
  			model: '=ngModel',
  			ctrl: '=ctrl',
  			showFilterBox: '='
  		},
  		templateUrl: kbAdminFiltersPath.path + 'filter.html',		// I hate having paths here!
  		controller: 'FiltersController as filterCtrl',
  		replace: true,
  		link: function() {}
  	};
  };
