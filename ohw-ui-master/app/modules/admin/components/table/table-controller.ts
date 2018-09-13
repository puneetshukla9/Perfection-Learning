'use strict';

export default function(AdminData, TableDefaults, State, $state, $stateParams, OneRoster, GridPagination,
		ViewDefinitions, $rootScope, $location, PubSub, $timeout, $scope, $window, uiGridConstants, AppState, Student, Course) {

		var oneRosterLockout = OneRoster.isLockedOut();

		var self = this;
		var isClassRoster = false;
		self.filterOnValue = '';
		self.dropdownValue = '';
		self.filteredOutAllResults = false;
		self.selectedSchool = null;
		self.hideGridUntilAdminSelect = false;

		var isDistAdmin = AppState.get('isDistAdmin');
		var isPLCAdmin = AppState.get('isPLCAdmin');
		self.isPLCAdmin = isPLCAdmin;

		self.columnNames = [];

		self.init = function() {
			if (!self.view) self.view = ViewDefinitions.getById($state.$current.name);
			isClassRoster = (self.view.id === 'adminApp.classes.classesStudents');
			if (isClassRoster) {
				setClassName();
			}

			self.columnNames = self.view.searchFilterFields || [];
			if (isDistAdmin && self.view.searchFilterFieldsDistrAdmin) {
				self.columnNames = self.columnNames.concat(self.view.searchFilterFieldsDistrAdmin);
			}

			if (isDistAdmin && $state.$current.name === 'adminApp.selectExisting') {
				self.hideGridUntilAdminSelect = self.view.showSchoolDropdown();
			}
		};

		self.init();

		$scope.refresh = false; // this helps re-render the grid

		// Used by Class Roster view to set the class name.
		function setClassName() {
			var classList = State.get('classes') || [];
			if (classList.length > 0) {
				var courseData = _.find(State.get('classes'), { course_id: $stateParams.id });
				var courseName = _.has(courseData, 'name') ? courseData.name : '';
				self.view.name = `Class Roster ${courseName}`;
			}
		}

		// remember that some State data depends on $stateParams.id
		var assembleGrid = function(view, localParams) {
			if (!localParams) localParams = {};
			self.rowsSelected = false;
			self.gridOptions = {};
			self.actionBar = !(view.oneRosterLock && oneRosterLockout) && _.has(view, 'actions') ? view.actions : [];
			self.gridOptions.appScopeProvider = self;
			self.gridOptions = _.extend(self.gridOptions, TableDefaults);
			self.gridOptions = _.extend(self.gridOptions, view.gridOptions);
			self.gridOptions.enableHorizontalScrollbar = 0;
			self.gridOptions.enableFiltering = true;
			self.gridOptionsuseExternalFiltering =  true;
			self.gridOptions.columnDefs[0].sort = {
				direction: uiGridConstants.ASC, // default name sorting ascending
				priority: 0
			};
			GridPagination.get(self.gridOptions);
			if (oneRosterLockout) {
				// If oneRosterLocked is set, remove checkbox from beginning of each row.
				self.gridOptions.enableRowHeaderSelection = false;
			}

			//additional fields for district adminstrators
			if (isDistAdmin && view.columnsForDistrAdmin && view.columnsForDistrAdmin.length > 0) {
				self.gridOptions.columnDefs = self.gridOptions.columnDefs.concat(view.columnsForDistrAdmin);
				self.showSchoolDropdown = () => { return view.showSchoolDropdown ? view.showSchoolDropdown() : false; };
			}

			if (self.view.id === 'licenseList') { // change 'mathX' to superscript:
				self.gridOptions.columnDefs[0].cellTemplate =
					'<div class="ui-grid-cell-contents ui-grid-cellNav">' +	// title="TOOLTIP">'+
						'<math-x input="COL_FIELD CUSTOM_FILTERS">' +
						'{{COL_FIELD CUSTOM_FILTERS}}</math-x></div>';
			}

			if (view.gridSourceFetch) {
				console.log('fetching necessary data');
				var param = $stateParams[view.gridSourceFetchKey];
				if (!param) param = localParams[view.gridSourceFetchKey];
				if (param) {
					view.gridSourceFetch(param).then(function() {
						self.gridOptions.data = State.get(view.gridSource);
						self.refresh();
					});
				}
			} else {
				if (view.gridSourceTransform) {
					self.gridOptions.data = view.gridSourceTransform(State.get(view.gridSource));
				} else {
					self.gridOptions.data = State.get(view.gridSource);
				}
			}
			$scope.refresh = true;
			$timeout(function() { $scope.refresh = false; }, 0);
		};

		// Allow search term to be cleared if a different list is selected.
		if (AppState.get('adminLastViewId') !== self.view.id) {
			AppState.set('plcsearch', { term: '' });
		}

		assembleGrid(self.view);

		// Changed from $rootScope to $scope, following suggestion at https://github.com/angular-ui/ui-router/issues/1338
		// Seems to prevent increasing triggers.
		$rootScope.$on('$stateChangeSuccess', function() {
			var id = $state.$current.name;
			self.view = ViewDefinitions.getById(id);
			if (_.has(self.view, 'gridOptions')) {
				assembleGrid(self.view);
			}
		});

		self.showSearchFilter = true;

		self.showSearchFilter = self.view.searchFilterFields &&
								self.view.searchFilterFields.length > 0;

		self.showMakeSelection = ($state.$current.name !== 'adminApp.licenses.licenseList');

		self.gridOptions.onRegisterApi = function(gridApi) {
			$scope.gridApi = gridApi;

			if (!isPLCAdmin) {
				$scope.gridApi.grid.registerRowsProcessor( self.filterOnTerm, 200 );
			}

			$scope.gridApi.core.on.rowsRendered($scope, function() {
				GridPagination.set(self.gridOptions);
				TableDefaults.checkVerticalScroll($scope.gridApi, self.gridOptions, $scope.gridApi.grid.gridHeight);
				TableDefaults.checkPagination($scope.gridApi, self.gridOptions);
			});

			$scope.gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows){
				var selectedRows = $scope.gridApi.selection.getSelectedGridRows();
				self.selectedRows = [];
				for (var key in selectedRows) {
					self.selectedRows.push(selectedRows[key].entity);
				}

				if (isDistAdmin) {
//					if (self.selectedRows.length > 0 && self.selectedSchool !== null) {
					if (self.selectedRows.length > 0) {
						self.rowsSelected = true;
					} else {
						self.rowsSelected = false;
					}
				} else {
					self.rowsSelected = self.selectedRows.length === 0  ? false : true;
				}

			});

			$scope.gridApi.selection.on.rowSelectionChanged($scope, function(row){
				var selectedRows = $scope.gridApi.selection.getSelectedGridRows();
				self.selectedRows = [];
				for (var key in selectedRows) {
					self.selectedRows.push(selectedRows[key].entity);
				}

				if (isDistAdmin) {
//					if (self.selectedRows.length > 0 && self.selectedSchool !== null) {
					if (self.selectedRows.length > 0) {
						self.rowsSelected = true;
					} else {
						self.rowsSelected = false;
					}
				} else {
					self.rowsSelected = self.selectedRows.length === 0  ? false : true;
				}

			});

			$scope.gridApi.core.handleWindowResize();

		};

		$scope.$on('$destroy', function(){
			$scope.gridOptions = null;
			$scope.gridApi = null;
		});

		$scope.$on('initial fetch complete', function() {
//			self.gridOptions.data = State.get(self.view.gridSource);
			if (self.view.gridSourceTransform) {
				self.gridOptions.data = self.view.gridSourceTransform(State.get(self.view.gridSource));
			} else {
				self.gridOptions.data = State.get(self.view.gridSource) || [];
			}

			if (isClassRoster) {
				setClassName();
			}
		});

		self.filterOnTerm = function( renderableRows ){
			var matchfound = false;
			if (self.columnNames &&
				self.columnNames.length > 0  &&
				renderableRows.length > 0) {
				var matcher = new RegExp(self.filterOnValue, 'i');
				var dropdownMatcher = new RegExp(self.dropdownValue);
				renderableRows.forEach( function( row ) {
					var match = false;
					var matchDropdown = false;
					// check for match with text filter.
					self.columnNames.forEach(function( fielditem ) {
						if (row.entity[fielditem] && row.entity[fielditem].toString().match(matcher)) {
							match = true;
						}
					});
					// check for match with dropdown.
					self.columnNames.forEach(function( fielditem ) {
						if (row.entity[fielditem] && row.entity[fielditem].toString().match(dropdownMatcher)) {
							matchDropdown = true;
						}
					});

					if (match && matchDropdown) {
						matchfound = true;
					} else {
						row.visible = false;
					}
				});
			}

			if (matchfound !== true) {  //no matches
				self.filteredOutAllResults = true;
			} else {
				self.filteredOutAllResults = false;
			}

			return renderableRows;

		};

		self.drill = function(row) {
			console.log('table-controller self.drill dest', self.view.drillDest);
			if (self.view.drillDest) {
				var uniqueId = row[self.view.drillUniqueId];
				$state.go(self.view.drillDest, { id: uniqueId });
			}
		};

		self.refresh = function() {
			self.gridOptions.data = State.get(self.view.gridSource);

			if (isPLCAdmin || isDistAdmin && $state.$current.name === 'adminApp.selectExisting') {
				if (!isPLCAdmin && self.view.showSchoolDropdown()) {
					if (self.selectedSchool === null || self.selectedSchool === undefined) {
						self.hideGridUntilAdminSelect = true;
					} else {
						self.hideGridUntilAdminSelect = false;
					}
				} else {
					self.hideGridUntilAdminSelect = false;
				}
			}

			if ($scope.gridApi) {
				$scope.gridApi.selection.clearSelectedRows();
			}
			self.redraw();
		};

		self.redraw = function() {
			if ($scope.gridApi) {
				$scope.gridApi.grid.refresh();
				$scope.gridApi.grid.handleWindowResize();
			}
		};

		self.deleteRows = function(arr) {
			_.each(arr, function(selectedRow) {
				var index = $scope.ctrl.gridOptions.data.indexOf(selectedRow);
				if (index >= 0) $scope.ctrl.gridOptions.data.splice(index, 1);
			});
			if ($scope.gridApi) $scope.gridApi.grid.refresh();
		};


		//assigns the search term passed in the filterTable event published to scope's filterOnValue
		self.handleFilter = function (publishedObj) {
			self.filterOnValue = publishedObj.term;
			self.refresh();
		};

		self.handleDropdown = function(obj) {
			self.dropdownValue = obj.term;
			self.refresh();
		};

		self.handlePLCSearch = function (publishedObj) {
			if (publishedObj.term.length > 3) {
				assembleGrid(self.view, publishedObj);
			}

			if (self.view.id === 'adminApp.plcLicenses.licenseList') {
				AppState.set('plcsearch', publishedObj);
			} else if (self.view.id === 'plcAdminApp.users.usersList') {
				AppState.set('plcsearch', publishedObj);
			}
		};

		self.updateSource = function(publishedObj) {
			if (self.view.gridSource === 'students') {
				// REST call to get students for school. Which absolutely shouldn't go here.
				Student.getBySchool(publishedObj.term).then((res) => {
					self.selectedSchool = publishedObj.term;
					self.handleDropdown(publishedObj);
				});
			}
		};

		if (self.view.id === 'adminApp.plcLicenses.licenseList') {
			AppState.set('adminLastViewId', 'adminApp.plcLicenses.licenseList');
			if (AppState.get('plcsearch')) {
				self.handlePLCSearch(AppState.get('plcsearch'));
			}
		} else if (self.view.id === 'plcAdminApp.users.usersList') {
			AppState.set('adminLastViewId', 'plcAdminApp.users.usersList');
			if (AppState.get('plcsearch')) {
				self.handlePLCSearch(AppState.get('plcsearch'));
			}
		}

		PubSub.subscribe('tableDataChanged', self.refresh, $scope);

		PubSub.subscribe('filterTable:newTerm', self.handleFilter, $scope);
		PubSub.subscribe('plcSearch:userSearch', self.handlePLCSearch, $scope);
		PubSub.subscribe('filterTable:dropdownSelect', self.updateSource, $scope);

	};
