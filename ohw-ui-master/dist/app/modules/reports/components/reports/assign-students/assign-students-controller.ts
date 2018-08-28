'use strict';

// The main Reports view
export default function(ReportData, ReportActions, State, PubSub, FilterManager, $scope, $rootScope) {
	var self = this;

	State.set('curReportView', 'asstd');
	$scope.$on('class change', (e, course) => {
		ReportData.classChange(course).then(checkReportData);
	});

	$scope.$on('reportDataLoaded', (event, data) => {
		checkReportData(data.reportData);
	});

	//ReportData.get().then(checkReportData);

	function checkReportData(reportData) {
		self.reportData = reportData;
		self.noData = (!self.reportData.studentScores || self.reportData.studentScores.length === 0);
		FilterManager.setPreserveFilters(false);
	}

	self.emptyReportMsg = ReportData.reportEmptyMsg('assignments');

	self.sort = State.get('assignStudentsSort') || 'name';

	self.toProblems = function(model)
	{
		var filters = State.get('reportFilter');
		filters.student = model.id;
		State.set('reportFilter', filters);

		PubSub.publish('reportChange', { report: 'asprob', filters: filters });
	};

	self.sortClick = function(key)
	{
		if (self.sort === key) {
			self.sort = '-' + key;
		} else {
			self.sort = key;
		}
		State.set('assignStudentsSort', self.sort);
	};
};
