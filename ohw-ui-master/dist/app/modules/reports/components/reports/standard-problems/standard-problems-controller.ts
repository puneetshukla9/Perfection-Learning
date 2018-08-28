'use strict';

export default function(ReportData, ReportActions, State, FilterManager, $uibModal, $scope, $rootScope) {
	var self = this;

	State.set('curReportView', 'stdprob');
	$scope.$on('class change', (e, course) => {
		ReportData.classChange(course).then(checkReportData);
	});

	$scope.$on('reportDataLoaded', (event, data) => {
		checkReportData(data.reportData);
	});

	//ReportData.get().then(checkReportData);

	function checkReportData(reportData) {
		self.reportData = reportData;
		self.noData = (!self.reportData.assignProbs || self.reportData.assignProbs.length === 0);
		FilterManager.setPreserveFilters(false);
	}

	standardProbsInit();

	self.emptyReportMsg = ReportData.reportEmptyMsg('standards');

	self.sort = State.get('standProblemSort') || 'questionLabelSort';

	// Initialization routine called before the
	// Standard Problems report.
	function standardProbsInit() {
		// If the standard filter is set to one of the "ALL" options, clear it.
		ReportData.clearFiltersWithAll('standard');
	}

	// Format a list of multiple choice options
	//
	// @FIXME/dg: This is used in multiple places! Move this
	// to the (non-existant) Problem class!
	self.formatChoices = function(list) {
		var out = [];

		for (var i = 0, len = list.length; i < len; i++)
			out.push( '<span class="noWrap">&#x25CF;&nbsp;' + list[i].a + '</span>');

		return out.join('&#x2002; ');
	};

	self.nameList = function(list) {
		var out = [];

		for (var i = 0, len = list.length; i < len; i++)
			out.push(list[i].first + ' ' + list[i].last);

		return out;
	};

	self.sortClick = function(key) {
		if (self.sort === key) {
			self.sort = '-' + key;
		} else {
			self.sort = key;
		}
		State.set('standProblemSort', self.sort);
	};

	self.multiStudent = function() {
		return !ReportData.isStudentFilter();
	};

	// Open the Set Filters modal
	self.showNames = function(model) {
		if (!self.multiStudent())
			return;

		var template = require('../../shared-modals/names-list.html');
		// Create the modal
		var modal = $uibModal.open({
			templateUrl: template,
			controller: 'ShowNamesCtrl as ctrl',
			resolve: {
				model: function() { return model; }
			}
		});
	};

};
