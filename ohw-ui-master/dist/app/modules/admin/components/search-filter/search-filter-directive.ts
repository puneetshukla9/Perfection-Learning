'use strict';

export default function() {
  	return {
  		restrict: 'E',
  		scope: {
  			model: '=ngModel',
  			ctrl: '=ctrl'
  		},
  		templateUrl: '/app/modules/admin/components/search-filter/searchfilter.html',	
  		controller: 'FiltersController as filterCtrl',
  		replace: true,
  		link: function() {}
  	};
  };
