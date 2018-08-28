'use strict';

// The main Reports view
export default function(ReportData, ReportActions, FilterManager, State, PubSub, $timeout, $scope, $rootScope) {
	var self = this;
	var barHeightAdj = 50;

	$scope.$on('class change', (e, course) => {
		ReportData.classChange(course).then(checkReportData);
	});

	ReportData.get().then(checkReportData);

	function checkReportData(reportData) {
		self.reportData = reportData;
		self.noData = (!self.reportData.standards || self.reportData.standards.length === 0);
		self.graphHeight = calcGraphHeight();
		FilterManager.setPreserveFilters(false);
	}

	self.emptyReportMsg = ReportData.reportEmptyMsg('standards');

	// This is a reference, so changes *should* be automatically detected
	self.reportData = ReportData.get();

	function calcGraphHeight() {
		return ((1 + self.reportData.standards.length) * barHeightAdj) + 'px';
	}

//	startTimer();

	self.toStandardList = function(id) {
		var filters = State.get('reportFilter');
		filters.standard = 'p_' + id;
		State.set('reportFilter', filters);

		PubSub.publish('reportChange', { report: 'stdlist', filters: filters });
	};

	function startTimer() {
		self.noData = false;
		var timeOutDuration = 2000; // 2 sev
		self.timer = $timeout(function() {
			if (!self.reportData.standards || !self.reportData.standards.length)
				self.noData = true;
		}, timeOutDuration);
	}

	function stopTimer() {
		$timeout.cancel(self.timer);
	}

};
