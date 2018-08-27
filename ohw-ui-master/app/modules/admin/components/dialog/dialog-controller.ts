'use strict';

export default function($scope, State, $uibModalInstance, data) {

	var self = this;
	self.dlg = State.get('curDlg');

	// // editClass:
	// self.secName = '';
	// self.password = '';

	function setState(bool) {
		if (bool) {
			if (self.dlg.stateName) {
				State.set(self.dlg.stateName, bool);
			}
		} else {
			if (self.dlg.stateName && State.get(self.dlg.stateName)) {
				State.set(self.dlg.stateName, false);
			}
		}
	}

	setState(false);

	$scope.view = {};
	$scope.view.isModal = true;
	$scope.data = data;

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.keepDisabled = function(selected, data, field) {
		data = data.map((obj) => obj[field]);
		var unselected = data.indexOf(selected) === -1;
		return unselected;
	};

	$scope.continue = function() {
		setState(true);
		$uibModalInstance.close({ bool: true, scope: $scope, data: data }); // was true
	};

	$scope.formatLabel = function(model, modelKey, displayKey) {
		var config = {};
		config[modelKey] = model;
	    var result = _.find(data, config);
	    if (result) {
	      return result[displayKey];
	    } else {
	      return '';
	    }
	};

};
