'use strict';

export default function($rootScope, $timeout, $state, State, AppState,
	TableDefaults, uiGridConstants, Student, Assignment, AssignmentHelper, Calendar, CalendarHelper, $scope, $anchorScroll, $window) {

	var self = this;
	var latestEntry = {};

	var assignData;
	var rosterCopy;

	self.opened = [];
	self.today = new Date();

	$rootScope.assignGen = $rootScope.assignGen || {};

	if ($state.params.id) {
		AssignmentHelper.load($state.params.id).then(() => { init(); });
	} else {
		$timeout(() => { $state.go('assignGenApp.details'); });
	}

	function init() {
		$anchorScroll();
		assignData = AssignmentHelper.getData();
		self.assign = AssignmentHelper.getCollapsed();	// ID, Quantity, Points -- No other problem data
		self.assignName = assignData.name;

		delete $rootScope.assignGen.customWizardTabs;

		self.gridOptions = {};
		AssignmentHelper.addRosterDates(State, assignData).then((res) => {
			initializeRows();
		});
	}

	self.checkValid = function() {
		var count = AssignmentHelper.getCount();
		if (count) {
			$rootScope.assignGen.printValid = true;
		} else {
			$rootScope.assignGen.printValid = false;
		}
		return count;
	};

	self.checkValid();

	self.addToAssignment = function(id) {
		var studentIds = [];
		self.rosterData.forEach((item, ndx) => {
			if (item.id === id) {
				item.checked = !item.checked;
			}
			if (item.checked) {
				studentIds.push(parseInt(item.id, 10));
				if (!item.assigned) item.assigned = rosterCopy[ndx].assigned;
				if (!item.due) item.due = rosterCopy[ndx].due;
			} else {
				item.assigned = null;
				item.due = null;
			}
		});

		var data = {
			isSubAssign: true,
			subSetAssigned: studentIds
		};
		AssignmentHelper.setRoster(data);
		$rootScope.$broadcast('notification confirmation', { message: 'Added Students to Assignment', sticky: false });
	};

	self.addAll = function() {
		var data = {
			isSubAssign: false,
			subSetAssigned: []
		};
// Select all rows
		AssignmentHelper.setRoster(data);
		self.rosterData.forEach((item) => { item.checked = true; });
		console.log(self.rosterData);
		$rootScope.$broadcast('notification confirmation', { message: 'Added All Students', sticky: false });
	};

	self.removeAll = function() {
		var data = {
			isSubAssign: true,
			subSetAssigned: []
		};
		AssignmentHelper.setRoster(data);
		self.rosterData.forEach((item) => { item.checked = false; });
		console.log(self.rosterData);
// Clear all rows
		$rootScope.$broadcast('notification confirmation', { message: 'Removed All Students', sticky: false });
	};

	function initializeRows() {
		self.rosterData = State.get('roster');
		rosterCopy = _.cloneDeep(self.rosterData);
		self.rosterData.forEach((item) => {
			var id = +item.id;
			item.checked = assignData.subSetAssigned.indexOf(id) !== -1 || assignData.isSubAssign === false;
			if (!item.checked) {
				item.assigned = null;
				item.due = null;
			}
		});
	}

// For datepicker popup
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

	function toggle($event, entry, toggleWhich, closeWhich) {
		self.calendar.toggle($event, entry.id + toggleWhich, true);
		self.calendar.close($event, entry.id + closeWhich);
		$scope.checkCalendarState(entry);
	}

	function whenClosed($event, entry, whichDate) {
		self.calendar.close($event, entry.id + whichDate);
		$scope.checkCalendarState(entry);
	};


	$scope.checkCalendarState = function(entry) {
		var assignedKey = entry.id + '-assigned';
		var dueKey = entry.id + '-due';
		entry.selected = self.calendar.isOpen(assignedKey) || self.calendar.isOpen(dueKey);
		latestEntry = entry;
	};

	$scope.whenAssignedClosed = function($event, entry) {
		self.calendar.open($event, entry.id + '-due');
		whenClosed($event, entry, '-assigned');
	};

	$scope.whenDueClosed = function($event, entry) {
		whenClosed($event, entry, '-due');
	};

	$scope.toggleAssigned = function ($event, entry) {
		toggle($event, entry, '-assigned', '-due');
	};

	$scope.toggleDue = function ($event, entry) {
		toggle($event, entry, '-due', '-assigned');
	};

	$scope.updateDate = (instance) => {
		var result = CalendarHelper.validate(instance.assigned, instance.due);

		var dates = {
			assigned: result.assigned,
			due: result.due
		};
		rosterCopy.forEach((item) => {
			if (item.id === instance.id) {
				item.assigned = new Date(result.assigned);
				item.due = new Date(result.due);
			}
		});
		Assignment.updateInstance(assignData.id, instance.id, dates);
	};

};
