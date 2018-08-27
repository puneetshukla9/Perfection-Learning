'use strict';

export default function(ReportData, ReportActions, State, PubSub, FilterManager, $scope, $rootScope) {
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
		self.noData = (!self.reportData.stdList || self.reportData.stdList.length === 0);
		FilterManager.setPreserveFilters(false);
	}

	self.emptyReportMsg = ReportData.reportEmptyMsg('standards');

	self.sort = State.get('standListSort') || 'stdCodeSort';

	clearLowStdFilter();

	function clearLowStdFilter() {
		var filters = State.get('reportFilter');
		if (filters.standard && filters.standard.substring(0, 2) !== 'p_' && filters.standard !== 'all') {
			filters.standard = 'all';
			State.set('reportFilter', filters);
		}
	}

	self.toStudents = function(model) {
		var filters = State.get('reportFilter');
		filters.standard = model.bar.id;
		State.set('reportFilter', filters);
		if (filters.student === 'all') {
			PubSub.publish('reportChange', { report: 'stdstd', filters: filters });
		} else {
			PubSub.publish('reportChange', { report: 'stdprob', filters: filters });
		}
	};

	self.toProblems = function(model) {
		var filters = State.get('reportFilter');
		filters.standard = model.bar.id;
		State.set('reportFilter', filters);

		PubSub.publish('reportChange', { report: 'stdprob', filters: filters });
	};

	self.sortClick = function(key) {
		if (self.sort === key) {
			self.sort = '-' + key;
		} else {
			self.sort = key;
		}
		State.set('standListSort', self.sort);
	};

	self.multiStudent = function() {
		return !ReportData.isStudentFilter();
	};

};
