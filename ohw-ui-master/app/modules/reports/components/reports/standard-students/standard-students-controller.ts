'use strict';

// The main Reports view
export default function(ReportData, ReportActions, FilterManager, State, PubSub, $scope, $rootScope) {
	var self = this;

	State.set('curReportView', 'stdstd');
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

	self.emptyReportMsg = ReportData.reportEmptyMsg('standards');

	self.sort = State.get('standStudentsSort') || 'name';

	self.toProblems = function(model)
	{
		var filters = State.get('reportFilter');
		filters.student = model.id;
		State.set('reportFilter', filters);

		PubSub.publish('reportChange', { report: 'stdprob', filters: filters });
	};

	self.sortClick = function(key)
	{
		if (self.sort === key) {
			self.sort = '-' + key;
		} else {
			self.sort = key;
		}
		State.set('standStudentsSort', self.sort);
	};

};
