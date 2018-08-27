'use strict';

export default function($rootScope, $scope, $location, PubSub, kbDialog, AdminData, State, $http,
	$timeout, AppState, ActionsConfig, $state) {

	var self = this;

	self.showAlert = false;

	var showAlert = function() {
	  $rootScope.$broadcast('notification confirmation', { sticky: false, message: feedback });
	};

	function getSchoolsInDistrict() {
		var result = [];
		if (State.get('district_schools')) {
			var districtSchools = State.get('district_schools')[0];

			// we don't want the district school when adding students to class
			if ($state.$current.name !== 'adminApp.selectExisting') {
				result = districtSchools.schools_including_district;
			} else {
				result = districtSchools.schools;
			}

		}
		return result;
	}


	//for adding students to a class, we want to show 'select school' instead of all schools
	self.nullSelectLabel = 'All Schools';
	if ($state.$current.name === 'adminApp.selectExisting') {
		self.nullSelectLabel = 'Select School';
	}

	self.selectedSchool = null;
	self.schools = State.get('schools');
	self.schoolsInDistrict = getSchoolsInDistrict();
//	self.courses = _.uniq(AppState.get('courses'), 'course_id'); // issue with dupes - get this moved to the source
	self.courses = _.uniq(AppState.filteredCourses(), 'course_id'); // issue with dupes - get this moved to the source
	$rootScope.$on('initial fetch complete', () => {
		self.schoolsInDistrict = getSchoolsInDistrict();
	});

	self.selectSchool = !!AppState.get('isDistAdmin');

	self.setAction = function(action) {
		var
			modal,
			route,
			alertable, feedback, plc,
			fetch, transformer, callback, callbackData,
			id,
			params = action.param,
			actionConfig = ActionsConfig.getConfig(action.id);

		if (!actionConfig) return;

		modal = actionConfig.modal;
		route = actionConfig.route || false;
		fetch = actionConfig.fetch || false;
		plc = !!actionConfig.plc;
		transformer = actionConfig.transformer || false;
		callback = actionConfig.callback || false;
		id = actionConfig.id || null;
		alertable = !!(actionConfig.feedback);
		feedback = actionConfig.feedback || '';
		callbackData = [];

		// pass this into the fetch method
		var filterValue = State.get('viewFilter');

		// modal post close handler
		var modalResponse = function(result) {
      action.result = result.bool;
	  	var modalScope = result.scope;
	  	if (State.get(modal.stateName) && callback) {
				callback($scope, modalScope, filterValue, params, { alertable: alertable, feedback: feedback });
	  	}
	  	if (!callback && alertable) showAlert();
		};

		// execute the actions
		if (route) $location.path(route, false);
		console.log('running action id: ', id);
		if (fetch) {
			if (plc) {
				fetch(action.param).then((res) => {
					callback($scope, action.param, res);
				});
			} else if (transformer) {
				fetch(filterValue, $scope.ctrl.selectedRows).then(function(res) {
				  transformer(res).then(function(transformedData) {
						callbackData = transformedData;
						if (modal) {
							modal.data = transformedData;
			  			kbDialog.showDialog(modal).result.then(modalResponse);
						} else {
			  			if (alertable) showAlert();
			  			callback($scope, callbackData, filterValue, params, { alertable: alertable, feedback: feedback });
						}
		  		});
				});
			} else {
				fetch(filterValue, $scope.ctrl.selectedRows).then(function(data) {
					if (modal) {
						modal.data = data;
						kbDialog.showDialog(modal).result.then(modalResponse);
					} else if (callback) {
						callback($scope, data, filterValue, params, { alertable: alertable, feedback: feedback });
		  		}
				});
			}
		}

		if (!fetch && modal) {
	  	kbDialog.showDialog(modal).result.then(modalResponse);
		}

	};

	self.refresh = function() {
		var stateKey = 'schools';

		if (AppState.get('isDistAdmin')) {

			stateKey = 'district_schools';  //we want to use all schools in a district for district admins
		}

		self.schools = State.get(stateKey);

	// self.courses = _.uniq(State.get('schoolClasses'), 'course_id');
	};

	self.formatLabel = function(model) {
		var result = _.find(self.courses, { id: model });
		if (result) {
			return result.name;
		} else {
			return '';
		}
	};

	function selectSchool(obj, data) {
		console.log('selectSchool', data.dropdown_school_id);
		self.setAction({id: 'plcSelectSchool', param: data.dropdown_school_id });
	};

	PubSub.subscribe('tableDataChanged', self.refresh);
	PubSub.subscribe('classesListChanged', self.refresh);
	$rootScope.$on('plc:schooldropdown', selectSchool);

};
