'use strict';

// Manages data for the reports -- Mediator between data calculation and data visualization
// @FIXME/dg: Problems are currently managed in here too, which is bad. There should be a Problems model!
// @FIXME/dg: Move setClass and getGrades to (existing) models! There should be no Comm in here!
export default function(StandardModel, $rootScope, RosterModel, AssignmentModel, FilterManager,
	ReportCalc, GradeData, GradeRanges, State, Report, AppState, Course, Assignment, Grade, PubSub, VTP, $q, $state) {
	// Operations to perform before calculating a report (generally, async load operations)
	var precalc = {
		active: 0
	};

	var postCalc = {
		loadProblems: loadProblems
	};

	// That's definitely not best practice. Instead it should be maintained internally, with changes reported via event.
	// This will be shared directly (read-only) with the outside world.
	var reportData = {
		ranges: GradeRanges.get()
	};
	var currentCourseObj = AppState.get('curCourse');

	var emptyReportMsg = {
		assignments: 'Once students submit an assignment, the reports will display here.',
		standards: 'Once students submit an assignment aligned to standards, the reports will display here.',
		subassignments: 'This student was not given this assignment.'
	};
	var activeReport = setActiveReport($state.current.options || {});

// CHRIS: fix me
	var curCourse = AppState.get('curCourse') || {};

	$rootScope.$on('filterChanged', filtersStable);

// Report Init Routines

	// Clear filters that start with "All" -- In a few reports,
	// we can't use "All" settings because there's too much data.
	function clearFiltersWithAll(field) {
		var filters = State.get('reportFilter');

		// The "ALL" options all start with "all".
		// Other filters should use a number, not a string, so there should be no conflict.
		if (filters[field] && typeof(filters[field]) === 'string' && filters[field].substring(0, 3) === 'all') {
			delete filters[field];		// Deleting isn't necessarily correct, but we might not have any entries at this point.

			State.set('reportFilter', filters);
		}
	}

// Post-calculation Operations
	function loadProblems() {
		// Since we're using two separate storage variables, we need to wipe this one out in case we have an early exit.
		reportData.assignProbs = null;
		var deferred = $q.defer();
		var problemData = [];

		// Extract the list of problem IDs we care about
		var probIDs = _.map(reportData.problems, 'id');
		if (!probIDs.length) {
			deferred.resolve(problemData);
		} else {
			// Display the loading indicator
			// PubSub.publish('status', {act: 'loading'});
			var defaultStudentId = getDefaultStudentId();
			var filter = State.get('reportFilter');
			var assignId = filter.assign;
			var studentId = filter.student !== 'all' ? filter.student : defaultStudentId;
			var curReportView = State.get('curReportView');
			if (curReportView === 'asprob') {
				Report.getVTPProblems(assignId, studentId).then((data) => {
					problemData = saveProblems(data);
					deferred.resolve(problemData);
				}, probLoadError);
			} else if (curReportView === 'stdprob') {
				Report.getProblems(probIDs).then((data) => {
					problemData = saveProblemsVTP(data);
					deferred.resolve(problemData);
				}, probLoadError);
			}
		}

		return deferred.promise;
	}

	//
	// Simple error/retry handler for problem load failure
	//
	function probLoadError(err) {
		PubSub.publish('commError:failed', {
			err: err,
			retry: loadProblems
		});
	}

	// Prepare question label for sorting. Similar code to kbSort.
	function prepVal(rawVal) {
			var pad = '00000000';

		// zero-pad first group of digits in string.
		var preppedVal = rawVal.replace(/(\d+)/g, function(val) {
			return pad.substr(0, pad.length - val.length) + val;
		});
		return preppedVal;
	}

	// We need to store the data somewhere
	function saveProblems(data) {
		// PubSub.publish('status', {act: 'clear'});
		reportData.assignProbs = _.map(reportData.problems, function(prob) {
				var questionLabel = prob.assign + ' Question ' + (prob.num + 1);
				var questionLabelSort = prepVal(questionLabel);
				var src = data[prob.num];
				return _.merge({
					questionLabel: questionLabel,
					questionLabelSort: questionLabelSort,
					prefix: scaleFracs[src.prefix],
					q: scaleFracs(src.q),
					qImg: src.qImg,
					choices: src.choices,
					ansType: src.ansType
				}, prob);
		});
		return reportData;
	}

	function saveProblemsVTP(data) {

		// PubSub.publish('status', {act: 'clear'});
		reportData.assignProbs = _.map(reportData.problems, function(prob) {
			if (!data[prob.id]) {
				console.log('Warning: problem not found (' + prob.id + ')');
			} else {

				var src = data[prob.id];
				src.isVTP = !!src.vars;
				VTP.eval(src);
				var questionLabel = prob.assign + ' Question ' + (prob.num + 1);
				var questionLabelSort = prepVal(questionLabel);

				return _.merge({
				  questionLabel: questionLabel,
					questionLabelSort: questionLabelSort,
					prefix: scaleFracs(src.vtp.prefix),
					q: scaleFracs(src.vtp.q),
					qImg: src.qImg,
					choices: src.vtp.choices,		// @FIXME/dg: Scale each entry!
					ansType: src.ansType
				}, prob);
			}
		});

		return reportData;
	}



	// Make the MathML a bit more readable
	//
	// In the student app, we scale to 140%. Here we probably want
	// something a bit smaller. 100% is illegible, but 140% seems too large.
	//
	// This is a hack! We need to use our full MathML Cleanup library.
	var openFrac = /(<mfrac[^>]*>)/g;
	var closeFrac = /<\/mfrac>/g;

	function scaleFracs(str) {
		str = str || '';
		str = str.replace(openFrac, '<mstyle mathsize="140%">$1');
		str = str.replace(closeFrac, '</mfrac></mstyle>');

		return str;
	}

// Class change handlers (consider moving to a dedicated service)

	// The current class was just changed by the user.
	// Let the server know, request new grade data, and load standards.
	function classChange(data) {
		FilterManager.setPreserveFilters(false);
		currentCourseObj = data;
		return refreshData();
	}

	function refreshData() {
		var data = currentCourseObj;
		var deferred = $q.defer();

		RosterModel.setRoster(data.roster);
		State.set('curClass', data.id);

		var stdPromise = getStandards(data.standard).then((stdData) => {
			return stdData;
		});

		var grdPromise = getGrades(data.id).then((gradeData) => {
			limitStandards(data.id);
			return gradeData;
		}, deferred.reject);

		return $q.all([stdPromise, grdPromise]).then((res) => {
			FilterManager.resetFilters();

			return calcReportData(data.id); // used to be performPrecalc
		});
	}

	// Load grade data (or not, if it's already loaded)
	function getGrades(id) {
		// Don't bother if we already have the data (note that changes won't show up without a page reload!)
		if (!GradeData.exists(id)) {
			return Grade.get(id).then(function(response) {
				var data = ensurePastDue(response.data);
				gradesLoaded(id, data);
				// data: {students: array, assignments: array} assignments array includes student scores in problems array.
				return data;
			});
		} else {
			// Update the assignment list (to one that's already loaded)
			var assigns = GradeData.getAssigns(id);
			AssignmentModel.setAssignments(assigns);

			// Wait for the class change to complete before performing calculations
			var deferred = $q.defer();
			deferred.resolve();
			return deferred.promise;
		}
	}

	function ensurePastDue(data) {
		var today = new Date();
		var pastDueAssignments = data.assignments.filter(function(item) {
				var dueDate = new Date(item.due);
				return (dueDate < today);
		});
		data.assignments = pastDueAssignments;

		return data;
	}

	function gradesLoaded(id, data) {
		// Save the data to the model
		GradeData.set(id, data);

		// Update the assignment list
		AssignmentModel.setAssignments(data.assignments);
	}

	// Load the standard definitions for this class, which
	// varies by product.
	// Standards are cached at the Comm level.
	function getStandards(id) {
		// Return the promise to ensure proper sequencing, but also send the data to the model
		return Assignment.getHierarchy(id).then(function(data) {
			StandardModel.setStandards(data);
			return data;
		});
	}

	// Filter out standards from the UI that don't appear in
	// any of the grade data.
	function limitStandards(id) {
		// Get the master list of all used standards for the class. Ignore all filters.
		var usedStds = GradeData.getStandards(id, {});

		// Let the standards manager know which items exist
//		StandardModel.limitStandards(Object.keys(usedStds));
		StandardModel.limitStandards(usedStds);		// A hash is easier for lookups
	}

	// A filter was changed. Recalculate.
	function filtersStable() {
		//calcReportData(); // formerly performPrecalc
		getReportData().then((data) => {
			$rootScope.$broadcast('reportDataLoaded', { reportData: data });
		});
	}

	// (Re)calculate the data needed for the current report.
	function calcReportData(id) {
		var deferred = $q.defer();
		activeReport = setActiveReport($state.current.options || {});

		var filters = getFilters(activeReport.filters);

		// If an id wasn't passed in, ask the State.
		// If the State doesn't know, we're doomed. Go hide somewhere.
		id = id || AppState.get('curCourse').id;
		if (!id) return;

		var calc = activeReport.calc;
		if (calc) ReportCalc[calc](id, reportData, filters);
		// Perform post-calculation operations
		if (activeReport.postCalc) {
			postCalc[activeReport.postCalc](reportData).then((postCalcData) => {
				deferred.resolve(postCalcData);
			});
		}	else {
			deferred.resolve(reportData);
		}

		return deferred.promise;
	}

	// Returns a list of filters that are valid for this report
	function getFilters() {
		// Filters that can be disabled by reports. A couple (date ranges and sections) are always available.
		var clearableFilters = ['student', 'assign', 'standard', 'category'];

		// Filter the filter list. Some aren't valid for certain reports.
		var allowed = activeReport.filters || [];		// Whitelist of filters
		var filters = State.get('reportFilter');			// All currently active filters

		for (var i = 0, len = clearableFilters.length; i < len; i++) {
			// If the filter isn't in our whitelist, delete it.
			if (allowed.indexOf(clearableFilters[i]) === -1)
				delete filters[clearableFilters[i]];
		}

		return filters;
	}

	// API: Returns a reference to the reportData
	// Note: As is, this is somewhat questionable
	function getReportData() {
		var deferred = $q.defer();
		if (currentCourseObj) {
			deferred.resolve(refreshData());
		} else {
			deferred.resolve(reportData);
		}
		return deferred.promise;
	}

	function setActiveReport(report) {
		reportData.summary = report.summary;
		reportData.id = report.id;

		return report;
		// Questionable: Copy summary data into reportData
	}

	function isStudentFilter() {
		var filters = State.get('reportFilter');

		return (filters.student && filters.student !== 'all');
	}

	// Default student is the first student in the filter list, in which the first item is 'all'.
	// If there are no students, a return value of 0 should be harmless.
	function getDefaultStudentId() {
		var studentFilter = FilterManager.getList('student');
		return studentFilter && studentFilter.length ? studentFilter[1].id : 0;
	}

	function reportEmptyMsg(reportName) {
		return emptyReportMsg[reportName];
	}

	// Public API
	return {
		get: getReportData,
		classChange: classChange,
		clearFiltersWithAll: clearFiltersWithAll,
		isStudentFilter: isStudentFilter,
		reportEmptyMsg: reportEmptyMsg
	};

};
