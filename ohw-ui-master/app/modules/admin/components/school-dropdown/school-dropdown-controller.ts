'use strict';

export default function($rootScope, $scope, $location, $timeout, School, AppState, State, PubSub) {

	var self = this;
	var isPLCAdmin = AppState.get('isPLCAdmin');

  School.all(AppState).then(() => {
    if (isPLCAdmin) {
      var schools = State.get('schools');
			schools.forEach((item) => {
				item.name_state = item.name + ', ' + item.state;
			});
			$scope.schools = schools;
    }
  });

  $scope.formatLabel = function(model, modelKey, displayKey) {
		var config = {};
		config[modelKey] = model;
	  var result = _.find($scope.schools, config);
    $rootScope.$broadcast('plc:schooldropdown', { dropdown_school_id: model });
	  if (result) {
			$scope.$parent.dropdown_school_id = model;
	    return result[displayKey];
	  } else {
	    return '';
	  }
	};


};
