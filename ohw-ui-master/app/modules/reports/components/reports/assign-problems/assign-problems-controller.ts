'use strict';

// The main Reports view
export default function(ReportData, ReportActions, State, AssignmentModel, FilterManager, $uibModal, $scope, $rootScope) {
	var self = this;

	State.set('curReportView', 'asprob');
	$scope.$on('class change', (e, course) => {
		ReportData.classChange(course).then(checkReportData);
	});

	$scope.$on('reportDataLoaded', (event, data) => {
		checkReportData(data.reportData);
	});

	//ReportData.get().then(checkReportData);

	// Check for subset assignment and whether it was given to the selected student.
	function isStudentInSubAssign() {
		var result = true;
		var filters = FilterManager.getFilterSettings();
		var assigns = AssignmentModel.get('noAll');
		var assign = _.find(assigns, { id: filters.assign });
		if (assign && assign.isSubAssign) {
			if (filters.student && filters.student !== 'all') {
				var studentId = parseInt(filters.student, 10);
				var result = assign.subSetAssigned.indexOf(studentId) !== -1;
			}
		}

		return result;
	}

	function checkReportData(reportData) {
		self.emptyReportMsg = ReportData.reportEmptyMsg('assignments');
		// Check for assignment given to subset of students.
		// If student wasn't given this assignment, alter the emptyReportMsg accordingly.
		if (isStudentInSubAssign() === false) {
			self.emptyReportMsg = ReportData.reportEmptyMsg('subassignments');
		}
		self.reportData = reportData;
		self.noData = (!self.reportData.assignProbs || self.reportData.assignProbs.length === 0);
		FilterManager.setPreserveFilters(false);
	}

	assignProbsInit();

	self.emptyReportMsg = ReportData.reportEmptyMsg('assignments');

	self.sort = State.get('assignProblemSort') || 'num';

	// Initialization routine called before the
	// Assignment Problems report.
	function assignProbsInit() {
		// If the assignment filter is set to one of the "ALL" options, clear it.
		ReportData.clearFiltersWithAll('assign');
	}

	// Format a list of multiple choice options
	//
	// @FIXME/dg: This is used in multiple places! Move this
	// to the (non-existant) Problem class!
	self.formatChoices = function(list) {
		var out = [];
		for (var i = 0, len = list.length; i < len; i++)
			out.push( '<span class="noWrap">&#x25CF;&nbsp;' + list[i] + '</span>');

		return out.join('&#x2002; ');
	};

	// Open the Set Filters modal
	self.showNames = function(model) {
		if (!self.multiStudent())
			return;

		// Create the modal with the model
		var template = require('../../shared-modals/names-list.html');
		var modal = $uibModal.open({
			templateUrl: template,
			controller: 'ShowNamesCtrl as ctrl',
			resolve: {
				model: function() { return model; }
			}
		});
	};

	self.sortClick = function(key) {
		if (self.sort === key) {
			self.sort = '-' + key;
		} else {
			self.sort = key;
		}
		State.set('assignProblemSort', self.sort);
	};

	self.multiStudent = function()
	{
		return !ReportData.isStudentFilter();
	};

};
