'use strict';

// The main Reports view
export default function(ReportData, ReportActions, State, PubSub, FilterManager, $timeout, $scope, $rootScope) {
	var self = this;
	var barHeightAdj = [100, 75, 66, 60]; // based on eyeballing bar heights; adjust as desired.

	self.emptyReportMsg = ReportData.reportEmptyMsg('assignments');

	$scope.$on('class change', (e, course) => {
		ReportData.classChange(course).then(checkReportData);
	});

	ReportData.get().then(checkReportData);

	function checkReportData(reportData) {
		self.reportData = reportData;
		self.noData = (!self.reportData.categories || self.reportData.categories.length === 0);
		self.graphHeight = calcGraphHeight();
		FilterManager.setPreserveFilters(false);
	}

	self.reportData = ReportData.get();

	function calcGraphHeight() {
		var ndx = self.reportData.categories.length - 1;
		var barHeight = barHeightAdj[ndx] || barHeightAdj[3];
		return (self.reportData.categories.length * barHeight) + 'px';
	}

//	startTimer();

	self.toAssignList = function(id)
	{
		var filters = State.get('reportFilter');
		filters.category = id;
		filters.assign = 'all_' + id;
		State.set('reportFilter', filters);

		PubSub.publish('reportChange', { report: 'aslist', filters: filters });
	};
/*
	function startTimer() {
		var timeOutDuration = 2000; // 2 sev
	  self.timer = $timeout(function() {
			if (!self.reportData.categories || !self.reportData.categories.length)
				self.noData = true;
	  }, timeOutDuration);
	}

  function stopTimer() {
    $timeout.cancel(self.timer);
	}
	*/
};
