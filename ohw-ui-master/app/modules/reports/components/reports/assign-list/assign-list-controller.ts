'use strict';

// The main Reports view
export default function(ReportData, ReportActions, PubSub, State, FilterManager, $scope) {
	var self = this;

	$scope.$on('class change', (e, course) => {
		ReportData.classChange(course).then(checkReportData);
	});

	$scope.$on('reportDataLoaded', (event, data) => {
		checkReportData(data.reportData);
	});

	//ReportData.get().then(checkReportData);

	function checkReportData(reportData) {
		self.reportData = reportData;
		self.noData = (!self.reportData.assigns || self.reportData.assigns.length === 0);
		FilterManager.setPreserveFilters(false);
	}

	// Provide filtering for assignments with a subset of students.
	self.studentHasAssign = function(obj, index) {
		var filterSettings = FilterManager.getFilterSettings();
		var filterStudent = filterSettings.student;
		filterStudent = !filterStudent || filterStudent === 'all' ? false : parseInt(filterStudent, 10);

		var assign = self.reportData.assigns[index];
		var result = !filterStudent || filterStudent === 'all' ||          // no student filtering OR
		             !assign.isSubAssign ||                                // assignment is for all students OR
								 assign.subSetAssigned.indexOf(filterStudent) !== -1;  // assignment is for subset, and indicated student is in that subset
		return result;
	};

	self.emptyReportMsg = ReportData.reportEmptyMsg('assignments');

	self.sort = State.get('assignListSort') || 'assignNameSort';

	self.toProblems = function(model)
	{
		var filters = State.get('reportFilter');
		filters.assign = model.bar.id;
		State.set('reportFilter', filters);

		PubSub.publish('reportChange', { report: 'asprob', filters: filters });
	};

	// bar: 'pass', 'fail', 'excel'
	// model: Should contain an ID or other method of determining
	//        which bar was clicked.
	self.toStudentList = function(model)
	{
		var filters = State.get('reportFilter');
		filters.assign = model.bar.id;
		State.set('reportFilter', filters);
		if (filters.student !== 'all') {
			PubSub.publish('reportChange', { report: 'asprob', filters: filters });
		} else {
			PubSub.publish('reportChange', { report: 'asstd', filters: filters});
		}
	};

	self.sortClick = function(key)
	{
		if (self.sort === key) {
			self.sort = '-' + key;
		} else {
			self.sort = key;
		}
		State.set('assignListSort', self.sort);
	};

	self.multiStudent = function()
	{
		return !ReportData.isStudentFilter();
	};

};
