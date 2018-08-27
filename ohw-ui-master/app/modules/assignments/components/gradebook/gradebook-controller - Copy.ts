'use strict';

import * as Papa from 'papaparse';

export default function($scope, $compile, $filter, $interpolate, $q, $timeout,
									$templateRequest, $templateCache, TableDefaults,
									Gradebook, State, PubSub, Preferences, AppState,
									uiGridExporterService, uiGridConstants, uiGridExporterConstants, $state) {

	var self = this;
	self.ready = false;

	// var headerCellTemplate = require('./assign-header.html');
	$scope.gridOptions = {};
	$scope.isFppClass = false;

	var GradebookTableSettings = _.cloneDeep(TableDefaults);
	var HEADER_TEMPLATE = require('./grid/gradebook-grid-header.html');
	var ROW_TEMPLATE = require('./grid/gradebook-row-template.html');

	var AssignmentFilter = ['homework', 'test', 'quiz', 'ipractice'];

	var filterMap = {
		'assessments': 'homework',
		'quick checks': 'quickcheck',
		'quizboards': 'quizboard',
		'virtual labs': 'virtual lab'
	};
	var assignmentSortFields = {
		quickcheck: 'sortOrder',
		quizboard: 'sortOrder',
		'virtual lab': 'sortOrder'
	};

	var assignmentSortField = 'due';

	PubSub.subscribe('GradeMe', gradeAssign, $scope);

	$scope.$on('class change', function(e, className) {
		self.init(className.id);
	});

	$scope.$on('assignment filter', function(e, filter) {
		var typeKey = filter.assignmentType.toLowerCase();
		var type = filterMap[typeKey];
		AssignmentFilter = [];
		AssignmentFilter.push(type);
		assignmentSortField = assignmentSortFields[type] || 'due';
		self.init();
	});

	$scope.$on('$destroy', () => {
		$scope.gridOptions = {};
	});

	var renderHeaderCell = function (data, total, index) {
		var pending = data.pending ? 1 : 0;
		var assignIndex = 'Assignment ' + index;
		var headerScope = $scope.$new();
		headerScope.avg = self.averages[0][assignIndex];
		headerScope.num = total + 1;
		headerScope.assignId = data.id;
		headerScope.name = data.name || 'Assignment Not Named';
		headerScope.due = data.due.toString();
		headerScope.points = data.points;
		headerScope.type = data.type;
		headerScope.pending = pending;
		var template =
			'<assign-header avg="{{avg}}" num="{{num}}" assign-id="{{assignId}}" ' +
			'name="{{name}}" due="{{due}}" points="{{points}}" type="{{type}}" ' +
			'pending="{{pending}}"></assign-header>';
		return $interpolate(template)(headerScope);
	};

	var renderPrintHeaders = function(assign) {
		assign = _.sortBy(assign, 'due');
		var assignTotal = assign.length;
		var results = [];
		var avgs = {};
		var names = {};
		var points = {};
		var dues = {};
		var DESC_COL = 'Grade';
		avgs[DESC_COL] = 'Average';
		names[DESC_COL] = 'Assignment Name';
		points[DESC_COL] = 'Points Possible';
		dues[DESC_COL] = 'Date';
		_.each(assign, (assignment, i) => {
			var assignIndex = 'Assignment ' + i;
			var result = {};
			avgs[assignIndex] = self.averages[0][assignIndex];
			names[assignIndex] = assignment.name || 'Assignment Not Named';
			points[assignIndex] = assignment.points;
			dues[assignIndex] = $filter('date')(assignment.due, 'M/d/yy');
		});
		results = [dues, names, avgs, points];
		return results;
	};

	var translateMap = [
		{ oldKey: 'name', newKey: 'Name' },
		{ oldKey: 'studentID', newKey: 'Student ID' },
		{ oldKey: 'grade', newKey: 'Grade' }
	];

	var translateKeys = (data, mapping) => {
		var result = angular.copy(data);
		_.each(result, (row, i) => {
			for (var key in row) {
				var index = _.findIndex(mapping, { oldKey: key });
				if (index >= 0) {
					row[mapping[index].newKey] = row[key];
					delete row[key];
				}
			}
		});
		return result;
	};

	var buildExportCSV = () => {

		var headers = renderPrintHeaders(self.assigns);
		var data = angular.copy($scope.gridOptions.data);
		data = translateKeys(data, translateMap);
		var headersAndData = headers.concat(data);
		var fieldNames = _.map(self.assigns, 'fieldName');

		var template = Papa.unparse({
			fields: ['Name', 'Student ID', 'Grade'].concat(fieldNames),
			data: headersAndData
		});

		if (template) {
			var blob = new Blob([template], { type: 'text/csv' });
			return window.URL.createObjectURL(blob);
		} else {
			return false;
		}

	};

	var isFppProduct = () => {
		return AppState.get('curCourse').product === 'fpp';
	};

	self.init = function(courseId) {
		$scope.isFppClass = isFppProduct();
		$scope.gridOptions = {};

		var id = courseId || AppState.get('curCourse').id;
		self.ready = false;
		self.curFilter = 'All';
		self.subAssigned = {};

		var weights = Preferences.get('gradeWeights');
		var drop = Preferences.get('dropLowest');

		$scope.gridOptions = _.extend({}, TableDefaults, {
			enableGridMenu: false,
			enableVerticalScrollbar: 1,
			enableHorizontalScrollbar: 1,
			enablePinning: true,
			showHeader: true,
			headerTemplate: HEADER_TEMPLATE, // this loads after grid is instantiated so fails
			rowTemplate: ROW_TEMPLATE,
			sortInfo: { fields: ['name'], directions: ['asc'] },
			showGridFooter: false
		});

		Gradebook.load(id, AssignmentFilter).then(function(data) {
			Gradebook.setAssignmentAverage(data, self.curFilter);
			Gradebook.setStudentAverage(data, drop, weights); // this call depends on the above call
			self.averages = data.averages;
			$scope.noAssignments = !data || !_.has(data, 'assigns') || !data.assigns.length;
			$scope.gridOptions.data = data.students;
			$scope.gridOptions.columnDefs = buildColumnDefs(data.assigns);
			self.assigns = data.assigns;
			self.assigns.forEach((item) => {
				if (item.isSubAssign) {
					self.subAssigned[item.fieldName] = item.subSetAssigned;
				}
			});
			self.exportCSV = buildExportCSV();
			self.ready = true;
		});

	};

	self.filterGradebookData = function(assignmentFilter) {
	  var data = _.cloneDeep(self.originalData);
		var filteredAssigns = data.assigns;
		if (assignmentFilter) {
			filteredAssigns = filteredAssigns.filter((assign) => {
				return assignmentFilter.indexOf(assign.type) !== -1;
			});
		}
		var weights = Preferences.get('gradeWeights');
		var drop = Preferences.get('dropLowest');

		Gradebook.setAssignmentAverage(data, self.curFilter);
		Gradebook.setStudentAverage(data, drop, weights); // this call depends on the above call
		self.averages = data.averages;
		$scope.noAssignments = !data || !_.has(data, 'assigns') || !filteredAssigns.length;
		$scope.gridOptions.data = data.students;
		$scope.gridOptions.columnDefs = buildColumnDefs(filteredAssigns);
		self.assigns = filteredAssigns;
		self.exportCSV = buildExportCSV();
		self.ready = true;
	};

	self.init();

	function buildColumnDefs(assign) { //, headerCellTemplate) {
		var headerCellTemplate = '<div role="columnheader" class="average" ng-class="{ \'sortable\': sortable }">' +
				'<div class="ui-grid-cell-contents"><ul style="list-style-type: none; padding: 0; line-height: 18px;"><li>Avg: ' +
				self.averages[0].grade + '</li><li>Pts: ' +
						parseInt(self.averages[1].grade, 10) + '</li></ul></div></div>';
				headerCellTemplate = '<div role="columnheader" class="average" ng-class="{ \'sortable\': sortable }">' +
						'<div class="ui-grid-cell-contents"></div></div>';
		var pinnedColumnDefs = [
			{ name: 'name', displayName: 'Name', field: 'name', width: 200, pinnedLeft: true, enableHiding: false,
				sort: {
					direction: uiGridConstants.ASC, // default name sorting ascending
					priority: 0
				}
			},
			{ name: 'studentID', displayName: 'Student ID', field: 'studentID', width: 0, pinnedLeft: true, enableHiding: false,
				enableColumnMenu: false, showHeader: false, visible: false,
				cellTemplate: '<div class="kb-grade-cell ui-grid-cell-contents" ng-class="col.colIndex()">' +
						'<span ng-cell-text>{{row.entity[col.field]}}</span></div>'},
			{ name: 'grade', field: 'grade', displayName: 'Grade', width: 80, pinnedLeft: true, enableHiding: false,
				enableColumnMenu: false,  type: 'numberStr', showHeader: false,
				headerCellTemplate: headerCellTemplate,
				cellTemplate: '<div class="kb-grade-cell ui-grid-cell-contents" ng-class="col.colIndex()">' +
						'<span ng-cell-text>{{row.entity[col.field]}}</span></div>' }

		];

		var defs = pinnedColumnDefs;
		var ASSIGNMENT_COLUMN_WIDTH = 80;

		var assignTotal = assign.length;

		_.each(assign, (assignment, i) => {
			assignment.fieldName = 'Assignment ' + i;
		});

		assign = _.sortBy(assign, assignmentSortField);
		var template = '<div ng-click="grid.appScope.linkToGradeChange(row, col.colDef.assignId)"' +
				'class="kb-grade-cell ui-grid-cell-contents ng-binding ng-scope" ng-class="col.colIndex()">' +
				'<span ng-cell-text>{{row.entity[col.field]}}</span></div>';
		var templateSub = '<div uib-tooltip="{{grid.appScope.makeTooltipText(col.field, +row.entity.id)}}" tooltip-trigger="mouseenter" ' +
				'tooltip-append-to-body ng-click="grid.appScope.linkToGradeChange(row, col.colDef.assignId)"' +
				'class="kb-grade-cell ui-grid-cell-contents ng-binding ng-scope" ng-class="col.colIndex()">' +
				'<span ng-cell-text>{{row.entity[col.field]}}</span></div>';
		_.each(assign, (assignment, i) => {

			var t = assignment.isSubAssign ? templateSub : template;
			defs.push({
				assignId: assignment.id,
				name: assignment.fieldName, // ensures uniqueness
				width: ASSIGNMENT_COLUMN_WIDTH,
				enableColumnMenu: false,
				cellTemplate: t,
				headerCellTemplate: renderHeaderCell(assignment, assignTotal, i)
			});
		});

		return defs;
	}

	$scope.makeTooltipText = function(fld, id) {
			var text = '';
			if (self.subAssigned[fld] && self.subAssigned[fld].indexOf(id) === -1) {
				text = 'Assignment not applicable to this student';
			}
			return text;
	};

	$scope.linkToGradeChange = function(row, assignId) {
		var studentId = row.entity.id;
		$state.go('gradeChangeApp.assignStudent', { assign: assignId, student: studentId });
	};

	function gradeAssign(entry) {
		var data = Gradebook.get();
		var id = data.assigns[entry - 1].id;
		$state.go('gradeChangeApp.pendingAssign', { assign: id });
	}

	$scope.gridOptions.onRegisterApi = function(gridApi) {
		$scope.gridApi = gridApi;
	};

	//Mitr Code added by puneet
};
