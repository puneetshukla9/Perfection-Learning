'use strict';

import * as $ from 'jquery';

export default function(API, $state, $stateParams, $http, $rootScope, AppState, PubSub, State, $sce, $scope, $uibModal, AssignmentList,
								 AssignmentsData, ClassRoster, Preferences, DateConvert, Calendar, CalendarHelper, $window, Standard, $compile,
								 Gradebook, uiGridConstants, TableDefaults, $q) {
	var self = this;
	var updateDatesBuffer = {};
	var latestEntry = {};
	var scrollToId = '';
	const STD_LIMIT = 5; // num of stndards to display in column
	self.showOnlyShared = $stateParams.showOnlyShared;
	self.ready = false;

//	var sharedAssignmentsFilters = { book_id: _.uniq(AppState.get('courses').map(item => item.book_id))[0] };
	var sharedAssignmentsFilters = { book_id: _.uniq(AppState.filteredCourses().map(item => item.book_id))[0] };

	$scope.gridOptions = {};

	self.ready = false;

	$scope.gridOptions = {};

	var myTableSettings = _.cloneDeep(TableDefaults);
	myTableSettings.rowTemplate =
		'<div ng-class="{\'library-district\': row.entity.is_district }" ng-click="grid.appScope.drill(row.entity)" ' +
		'ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"' +
		'class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>';
	self.filterList = [
		'All',
		'Unassigned',
		'Assigned',
		'Past due date',
		'Not due yet'
	];

	self.calendar = Calendar;
	self.buttonBarConfig = {
		show: true,
		now: { show: true, text: 'Now' },
		today: { show: true, text: 'Today' },
		clear: { show: false, text: 'Clear' },
		date: { show: true, text: 'Date' },
		time: { show: true, text: 'Time' },
		close: { show: true, text: 'Close' }
	};

	$rootScope.assignGen = $rootScope.assignGen || {};

	function init() {
		var currentCourse = AppState.get('curCourse');
		if (!currentCourse) {  //default to first course if no currentCourse selected
//			currentCourse = AppState.get('courses')[0] || {};
			currentCourse = AppState.filteredCourses()[0] || {};
			AppState.set('curCourse', currentCourse);
		}

		self.loading = false;
		self.isAMSCO = (currentCourse.product === 'amsco');
		self.popOver = "'List/dateDetails.html'";
		self.asgnSelected = false;
		self.selectedAsgn = [];
		self.isTEICourse = AppState.get('TEIStates').indexOf(currentCourse.product_state) !== -1;

		// Preferences
		self.showStandards = Preferences.get('showStandards');
		self.curFilter = Preferences.get('listFilter') || 'All';
//		self.sortOrder = Preferences.get('sortOrder');
		self.sortOrder = State.get('sortOrder') || 'name';
		//self.sortOrder += 'Sort';

		if (self.isAMSCO) {
			self.popOver = '';
		} else { // mathX product:
			self.filterList.push('Requires grading');
		}
		// Load model data

		//grid options for shared assignments list
		$scope.gridOptions = {};

		$scope.gridOptions = _.extend({}, myTableSettings, {
			enableRowSelection: true,
			enableGridMenu: false,
			enableVerticalScrollbar: 2,
			enableHorizontalScrollbar: 0,
			enablePinning: true,
			multiSelect: true,
			showHeader: true,
			sortInfo: { fields: ['name'], directions: ['asc'] },
			showGridFooter: false,
			rowHeight: 40,
			columnDefs: [
				{field: 'type',
				 cellTemplate: `<div class="ui-grid-cell-contents typeIcon icon {{grid.appScope.list.getIcon(grid.getCellValue(row, col))}}" > </div>`,
				 displayName: '', width: '25'},
				{field: 'name',
 				 width: '*',
 				 cellTemplate: `<div class="ui-grid-cell-contents">
				 <a ng-if="grid.appScope.list.showEditLink(row.entity)"
 				 href class="editLink" ng-click="grid.appScope.list.editDetails(row.entity);">
 				 {{grid.getCellValue(row, col)}}</a><span ng-if="!grid.appScope.list.showEditLink(row.entity)">{{grid.getCellValue(row, col)}}</span></div>`},
//			 {field: 'name', width: '*'},
				{field: 'sharer', displayName: 'Shared By', width: '*'},
				{field: 'courseName', displayName: 'Class', width: '*'},
				{field: 'convStandards',
					displayName: 'Standards',
					cellTemplate: `<div class="ui-grid-cell-contents with-roll-over"
						uib-popover="{{grid.getCellValue(row, col)}}"
						popover-trigger="mouseenter"
						popover-append-to-body="true"
						popover-placement="top-left" >
							{{row.entity.displayStandards}}
						</div>`,
					width: '*'
				}
			],
			onRegisterApi: function(gridApi) {
				//set gridApi on scope
				$scope.gridApi = gridApi;

				gridApi.selection.on.rowSelectionChanged($scope, function(row) {
					if (!!row.isSelected) {
						//an assignment is selected, set asgnSelected & store the selectedRow's info
						self.asgnSelected = true;
						self.selectedAsgn.push(row.entity);
					} else {
						self.removeFromSelectedAsgn(row.entity.id);
					}

					if (self.selectedAsgn.length < 1) {
						self.asgnSelected = false;
					}

				});

				gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
					//clear out selectedAsgn array
					//for each row in rows that is selected, push on to selectedAsign
					var numSelected = 0;
					self.selectedAsgn = [];
					rows.forEach(function(row) {
						if (!!row.isSelected) {
							numSelected ++;
							self.selectedAsgn.push(row.entity);
						}
					});

					if (numSelected < 1) {
						self.asgnSelected = false;
					} else {
						self.asgnSelected = true;
					}
      			});

				$scope.gridApi.core.handleWindowResize();
				$scope.gridApi.core.refresh();
			}
		});

		var id = currentCourse.id; // Used to be AppState.get('courses')[0].id, which would olways retrieve first course;
		loadAssignList(id);

		$scope.$on('class change', function(e, course) {
			var id = course.id;
			loadAssignList(id);
			ClassRoster.get(id).then(setRoster);
			self.isAMSCO = (course.product === 'amsco');
		});

		ClassRoster.get(id).then(setRoster);

		Standard.init();

		$scope.$on('preferences changed', optChangePrefs);
		PubSub.subscribe('StateChange:curClass', classChanged, $scope);
		$rootScope.$on('Dropdown:sharedBy', sharedByChanged);
		$rootScope.$on('Dropdown:sharedAssignmentsProduct', productChanged);
	}

	init();

	self.resetSelectedAssgns = function() {
		self.selectedAsgn = [];
		self.asgnSelected = false;
	};

	self.getStdDescription = function(stdCode) {
		var description = Standard.map(stdCode);
		return $sce.trustAsHtml(description);
	};

	self.removeFromSelectedAsgn = function (asgnId) {
		_.remove(self.selectedAsgn, function(item){
			return asgnId === item.id;
		});
	};

	function loadAssignList(newID)	{
		self.loading = true;

		AssignmentList.get(newID, self.showOnlyShared).then(setAssignments, () => {
			self.importFailed = true;
			self.loading = false;
		});
	}

	function classChanged(newID) {
		self.resetSelectedAssgns();
		loadAssignList(newID);
		ClassRoster.get(newID).then(setRoster);
	}

  function sharedByChanged(e, payload) {
		var userId = payload.sharedBy;
		delete sharedAssignmentsFilters.sharedBy;
		delete sharedAssignmentsFilters.excludeLoggedIn;
		self.resetSelectedAssgns();
		if (userId > 0) {
			sharedAssignmentsFilters.sharedBy = userId;
		} else if (userId === -2) {
			sharedAssignmentsFilters.excludeLoggedIn = true;
		}
		$scope.gridOptions.data = massageDataForShared(self.assignments);
	}

	function productChanged(e, payload) {
		delete sharedAssignmentsFilters.book_id;
		delete sharedAssignmentsFilters.sharedBy;
		self.resetSelectedAssgns();
		var book_id = payload.book_id;
		if (book_id > 0) {
			sharedAssignmentsFilters.book_id = book_id;
		}
		$scope.gridOptions.data = massageDataForShared(self.assignments);
		setSharedBy($scope.gridOptions.data);
	}

	function reloadAssigns(info, refreshCache)	{
		var classID = AppState.get('curCourse').id;
		AssignmentList.get(classID, refreshCache).then(
			function (data) {
				setAssignments(data);
				$scope.checkCalendarState(latestEntry);
				Gradebook.load(classID, true).then(() => {
					self.loading = false;
					if (scrollToId) {
						scrollToAssignment();
					}
					scrollToId = undefined;
				});
			});
	}

	function setAssignments(data)	{
		self.loading = false;
		/*
		// Any idea why we were doing this? It appears to assume the sortOrder field will be something that it might make sense to set to the due date.
		// If the sortOrder is on the name field, item.name will be set to item.due.
		// Is there some field in the assignment that should be set unconditionally to the due date?
		data.forEach(function(item) {
			item[self.sortOrder] = item.due;
		});
		*/
		self.assignments = data;
		if (!!self.showOnlyShared) {
			if (State.get('licenses')) {
				$rootScope.$broadcast('StateChange:products');
			}
			$scope.gridOptions.data = massageDataForShared(data);
			setSharedBy($scope.gridOptions.data);
			self.ready = true;
			self.asgnSelected = false;
		}
	}

	function setSharedBy(data) {
		State.set('sharedListSharedby', data.filter(item => { return item.sharedBy; }).map(item => item.sharedBy));
		$rootScope.$broadcast('StateChange:sharedBy');
	}

	function massageDataForShared(dataList = []) {
		var convertedList = [];
		var filters = sharedAssignmentsFilters || {};

		dataList.forEach(function(item){
			var thisItem = _.cloneDeep(item);
			var thisItemStandards = _.uniq(item.standards);
			var sharedText;
			var myOwner = {};


			thisItem.convStandards = '';
			thisItem.displayStandards = '';

			if (thisItem.sharedBy) {
				sharedText = thisItem.sharedBy.first + ' ' + thisItem.sharedBy.last;
				myOwner = {name: sharedText, id: thisItem.sharedBy.id};
			} else {
				sharedText = '';
				myOwner = {name: AppState.get('user_name'), id: AppState.get('user_id')};
			}

			thisItem.sharer = sharedText;
			thisItem.owner = myOwner;

			thisItemStandards.forEach(function(stdObj, index) {
				thisItem.convStandards = thisItem.convStandards + stdObj;
				if (index < thisItemStandards.length - 1) {
					thisItem.convStandards = thisItem.convStandards + ', ';
				}
			});

			//trim the display version to 20 items or less if more and add ellipses.

			if (thisItemStandards.length > STD_LIMIT) {
				thisItem.displayStandards = thisItem.convStandards.split(',').slice(0, (STD_LIMIT - 1)).join(',') + '...';
			} else {
				thisItem.displayStandards = thisItem.convStandards;
			}
			convertedList.push(thisItem);
		});

		if (filters !== {}) {
			if (filters.sharedBy) {
				convertedList = convertedList.filter(item => {
					return (item.sharedBy && item.sharedBy.id === filters.sharedBy) || (parseInt(item.owner.id, 0) === parseInt(filters.sharedBy, 0));
				});
			}
			if (filters.excludeLoggedIn) {
				convertedList = convertedList.filter(item => {
					return (parseInt(item.owner.id, 10) !== parseInt(AppState.get('user_id'), 10));
				});
			}
			if (filters.book_id) {
				convertedList = convertedList.filter(item => {
					return item.book_id === filters.book_id;
				});
			}
		}
		return convertedList;
	}

	function setRoster(roster) {
		self.roster = roster;
	}

	function optChangePrefs(e, state) {
		self.showStandards = state.showStandards;
		self.curFilter = state.listFilter;
		self.sortOrder = state.sortOrder;
	}

	this.setFilter = function(val)	{
		self.curFilter = val;
		Preferences.set('listFilter', val);
	};

	this.canShow = function(val)	{
		return val && !isNaN(val.getTime());
	};

	this.canShowEntry = function(entry)	{
		var map = {
			'All': filterAll,
			'Unassigned': filterUnassigned,
			'Assigned': filterAssigned,
			'Past due date': filterPastDue,
			'Not due yet': filterNotDue,
			'Requires grading': filterPending
		};
		if (map[self.curFilter]) {
			return map[self.curFilter](entry);
		} else {
			return;
		}
	};

	self.showEditLink = function (entry) {
			return true;
			//return (entry.sharedBy && (parseInt(entry.sharedBy.id, 0) === parseInt(AppState.get('user_id'), 0)));
	};

	function filterAll() { return true;	}

	function filterUnassigned(entry)	{
		return !entry.due || isNaN(entry.due.getTime());
	}

	function filterAssigned(entry)	{
		return !filterUnassigned(entry);
	}

	function filterPastDue(entry)	{
		var now = Date.now();
		return entry.due && (now >= entry.due.getTime());
	}

	function filterNotDue(entry)	{
		var now = Date.now();
		return entry.due && (now < entry.due.getTime());
	}

	function filterPending(entry)	{
		return entry.pending;
	}

	this.dueByStudent = function(assign) {
		var id = AppState.get('curCourse').id;
		ClassRoster.get(id).then(
			function(data) {showRoster(assign, data); });
	};

	function showRoster(assign, roster)	{
		self.roster = roster;
		var modal = $uibModal.open({
			templateUrl: require('./student-select.html'),
			controller: 'StudentSelectCtrl as ctrl',
			resolve: {
				students: function() {return roster; },
				assignment: function() {return assign; }
			}
		});

		modal.result.then(haveRoster);
	};

	function haveRoster(results)	{
		self.dueDate(results.assign, results.list);
	};

	function updateDates(result)	{
		return AssignmentList.setDates(result.id, {
			assigned: result.assigned,
			due: result.due,
			students: result.students
		}).then(reloadAssigns);
	};

	this.isPastDue = function(entry)	{
		return filterPastDue(entry);
	};


	this.edit = function(entry)	{
		$rootScope.assignGen.edit = true;
		$state.go('assignGenApp.edit', { id: entry.id });
	};

	this.editDetails = function(entry) {
			$rootScope.assignGen.edit = true;
			// This is probably a heinous approach, but the details controller needs to be signaled to set the fields readonly if this assignment wasn't
			// authored by the logged in teacher.
			// $rootScope.assignGen.readonly: signals whether or not this assignment is readonly on the details page.
			// $rootScope.assignGen.customWizardTabs: customize the wizard tabs for 'view-problems'. This is specific to shared assignments.
			//$rootScope.assignGen.readonly = !(entry.sharedBy && (parseInt(entry.sharedBy.id, 10) === parseInt(AppState.get('user_id'), 10)));
			$rootScope.assignGen.readonly = true;
			$rootScope.assignGen.customWizardTabs = 'view-problems';
			$state.go('assignGenApp.edit', { id: entry.id, shared: true });
	};

	this.print = function(entry) {
		$rootScope.assignGen.edit = true;
		$state.go('assignGenApp.preview', { id: entry.id });
	};

	this.customize = function(entry) {
		$rootScope.assignGen.edit = true;
		$state.go('assignGenApp.roster', { id: entry.id });
	};

	var urlConfig = AppState.get('url');

	this.studentView = function(entry){
		$http.put(API.BASE + 'output/wrapping/set', { wrap_output: false }).then(function() {
			if (self.isTEICourse) {
				window.location.href = window.location.protocol + '//' + window.location.hostname + '/books/student-app/index.html#assignments/' + entry.id;
			} else {
				window.location.href = window.location.protocol + '//' + window.location.hostname + '/books/teacher/project.html#assign/' + entry.id;
			}

		});
	};

	this.viewGrades = function(entry)	{
		window.location.href = urlConfig('grades') + urlConfig('view') + entry.id;
	};

	this.adjustGrades = function(event, entry)	{
		event.stopPropagation();
		event.preventDefault();
		var path = AppState.get('adjustLink');
		$state.go('gradeChangeApp.pendingAssign', { assign: entry.id });
		// window.location.href = path + 'pending/' + entry.id + '?done=list';	// Pending only
	};

	this.canDelete = function(entry)	{
		return self.isAMSCO && !entry.isTemplate;
	};

	this.deleteResetAssign = function(entry)	{
		var modal = $uibModal.open({
			templateUrl: require('./delete-confirm.html'),
			controller: 'DeleteConfirmCtrl as data',
			resolve: {
				assign: function() {return entry; }
			},
			size: 'md'
		});

		modal.result.then(function(id) {
			AssignmentList.remove(id).then(
				function (info) {
					updateDatesBuffer = {};
					reloadAssigns(info);
				});
		});
	};

	this.importAssign = function()	{
		var modal = $uibModal.open({
			templateUrl: require('./import-assignment.html'),
			controller: 'AssignImportCtrl as data',
			resolve: {
				assign: function() {return self.selectedAsgn; },
				courselist: function() {
//					return self.formatCourseList(AppState.get('courses'));
					return self.formatCourseList(AppState.filteredCourses());
				}
			},
			size: 'md'
		});

		modal.result.then(
			function (selectedInfo) {

				if (selectedInfo.pickedCourses && selectedInfo.pickedCourses.length > 0) {
					self.importAssignsToClasses(selectedInfo.assign, selectedInfo.pickedCourses);
				}
		});
	};

	self.importAssignsToClasses = function(assignments, classesToImportTo) {
		var promiseArray = [];

		assignments.forEach(function (curAssgn) {
			classesToImportTo.forEach(function(curClass) {
				if (!self.assgnAlreadyExistsInClass(curAssgn, curClass)) {
					promiseArray.push(AssignmentList.importToCourse(curAssgn.id, curAssgn.name, curClass.id));
				}
			});
		});

		$q.all(promiseArray).then(function(dataArray) {
			self.selectedAsgn = [];  //reset the array of selected.
			$rootScope.$broadcast('notification confirmation', { message: 'Assignment import complete.', sticky: false });
			reloadAssigns(null, self.showOnlyShared);
		});

	};

	self.assgnAlreadyExistsInClass = function(assgn, course) {
		//replace the dashes in the course text with spaces so it matches the assgn's coursename
//		return assgn.courseName === course.text.replace(/\-/g, ' ');
		return assgn.course_id === course.id;
	};

	self.setSort = function(key)	{
		if (self.sortOrder === key) {
			self.sortOrder = '-' + key;
		} else {
			self.sortOrder = key;
		}

		State.set('sortOrder', self.sortOrder);
//		Preferences.set('sortOrder', self.sortOrder);

	};

	self.getIcon = function(type)	{
		return AssignmentList.icon(type);
	};

	self.formatStandards = function(list)	{
		if (!list.length)
				return list;

		var stds = list.sort(_std_sort);
		list = _.map(stds, function(key) {
				return key;
			});
		return list; //.join(', ');
	};

	self.formatCourseList = function(rawList) {
		return rawList.map(function(item){
			return {text: item.name, id: item.id, book_id: item.book_id };
		}).filter(item => { return item.book_id === sharedAssignmentsFilters.book_id; });

	};

	self.getStdDescription = function(stdCode) {
		var description = Standard.map(stdCode);
		//description = description.replace(/<sup>/g, '^'); // replace open superscript tab witrh '^'
		return description; //.replace(/<((.?i)|(\/sup))>/g, ''); // take out italic or superscript sup tabs
	};

	self.getComma = function(index, numOfstandards) {
		if (index < numOfstandards - 1 && numOfstandards > 1) {
			return ',';
		}
		return '';
	};

  function _std_sort(a, b) {
    var std1 = _std_parse(a);
    var std2 = _std_parse(b);
    var result = std1 && std2 ? _std_compare(std1, std2) : 0;
    return result;
  }


	// Parse standard code; e.g., APR-1 3a:
	// main: APR-1
	// num: 3
	// sub: a

    function _std_parse(str) {
        var stdRe = /^(\S+)[\s\.]+(\d+)(.+)?$/;
        var parts = stdRe.exec(str);
		if (parts) {
			return {
			    main: parts[1],
			    num: parts[2],
			    sub: parts[3]
			};
		} else {
			return null;
		}
    }


	// Compare parsed standard codes

  function _std_compare(std1, std2) {
    var result;
    if (std1.main < std2.main) {
		result = -1;
    } else if (std1.main > std2.main) {
		result = 1;
    } else if (std1.num * 1 < std2.num * 1) {
		result = -1;
    } else if (std1.num * 1 > std2.num * 1) {
		result = 1;
    } else if (!std1.sub || std1.sub < std2.sub) {
		result = -1;
    } else {
		result = 1;
    }
	return result;
  }

	self.prefs = {
		leadTime: Preferences.get('leadTime'),
		defaultAssigned: Preferences.get('defAssign'),
		defaultDue: Preferences.get('defDue'),
		useDefault: Preferences.get('autoAssignDate')
	};

	$scope.whenAssignedClosed = function($event, entry) {
		self.calendar.open($event, entry.id + '-due');
		whenClosed($event, entry, '-assigned');
	};

	$scope.whenDueClosed = function($event, entry) {
		self.resortDates();
		whenClosed($event, entry, '-due');
	};

	function whenClosed($event, entry, whichDate) {
		self.calendar.close($event, entry.id + whichDate);
		$scope.checkCalendarState(entry);
	};

	$scope.toggleAssigned = function ($event, entry) {
		toggle($event, entry, '-assigned', '-due');
	};

	$scope.toggleDue = function ($event, entry) {
		toggle($event, entry, '-due', '-assigned');
	};

	function toggle($event, entry, toggleWhich, closeWhich) {
		self.calendar.toggle($event, entry.id + toggleWhich, true);
		self.calendar.close($event, entry.id + closeWhich);
		$scope.checkCalendarState(entry);
	}

	$scope.checkCalendarState = function(entry) {
		var assignedKey = entry.id + '-assigned';
		var dueKey = entry.id + '-due';
		entry.selected = self.calendar.isOpen(assignedKey) || self.calendar.isOpen(dueKey);
		latestEntry = entry;
	};

	$scope.updateDate = function(assignment) {
		var result = CalendarHelper.validate(assignment.assigned, assignment.due);
		updateDatesBuffer = result;
		updateDatesBuffer.id = assignment.id;
	};

	self.resortDates = function() {
		var result = updateDatesBuffer;
		if (!result || _.isEmpty(result)) return;
		scrollToId = result.id;
		updateDates({
			id: result.id,
			assigned: result.assigned,
			due: result.due
		});

	};

	function scrollToAssignment() {
		var table = $('#assignmentTable');
		var pos = _.findIndex($scope.list.filtered, { id: scrollToId });
		if (pos !== -1) {
			var row = table.find('tr').eq(pos);
			if (row) {
				var w = window;
				var tableOffset = table.offset().top;
				var rowOffset = row.offset().top;
				$(w).scrollTop(38 + rowOffset + tableOffset - ($(w).height() / 2));
			}
		}
	};

};
