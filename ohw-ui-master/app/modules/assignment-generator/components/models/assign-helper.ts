'use strict';

export default function($state, $rootScope, AppState, Assignment, ProblemHelper, Course, $q, $timeout, TempID, PubSub) {
	var self = this;

	var lastDataId;
	var saveAttemptBuffer; // Hold save attempts made between initial save request and receipt of assignment ID.
	// Validation
	var maxLength = 250;	// Maximum length of strings
	var maxSubmits = 10;	// Maximum number of submissions

	var isNewAssignment = false;

	// Internal model

	var probList = [];		// Ordered list of problems {id: xxx, probID: xxx, points: xxx}
	var metaData = {
		id: TempID.get(),
		name: '',			// Assignment name (string)
		mode: 'homework',		// Assignment mode (string)
		submits: 1,				// Submission count (int >= 1)
		scoringMode: 'full',	// 'full': Full score regardless of submissions, 'deduct': Deduct points
		notes: '',				// Teacher notes
		studentNotes: '',		// Student notes
		hasSubmissions: false,
		isShared: false,			// Assignment is shared with other teachers
		isSubAssign: false,
		subSetAssigned: []
	};

	var probHash = {};		// Rapid lookup for problem IDs (optimization)
	var transList = {};		// ID translation list. Kept around for JIT conversion of IDs right before saving.

	var canSave = true;

	function initNew() {
		setID(TempID.get());
		setName('');
		setMode('homework');
		setDates({assigned: undefined, due: undefined});
		setSubmits(1);
		setScoring('full');
		setNotes('');
		setStudentNotes('');
		setSharing(false);
		setTeacher();
		setHasSubmissions(false);
		setRoster();
		initProblemList();
	}

	// Remap IDs for any problems that were using fake IDs

	function remapIDs(remapList) {
		_.forEach(remapList, function(perm, temp) {
			transList[temp] = perm;

			var idx = findProblem(temp);

			if (idx !== -1) {
				probList[idx].id = perm;
			} else {
				console.log("SYNC ERR: Can't find " + temp);
			}
		});
	}

/*
	// Ugly hack: Just before saving, update all temp IDs in
	// outgoing data.

	function preparePayload(data) {
		// Check for duplicate assignment condition
		if (data[0].id === '_1' && metaData.id !== '_1') {
			console.log('Catching duplicate assignment', metaData.id);
			data[0].id = metaData.id;
		}
		updateIDs(data);
	}
*/

	// Ugly hack: Just before saving, update all temp IDs in
	// outgoing data.

	function updateIDs(data) {
		for (var i = 0, len = data[0].probs.length; i < len; i++) {
			var entry = data[0].probs[i];
			if (transList[entry.id])
				entry.id = transList[entry.id];
		}
	}


	// API:

	function exists(probID) {
		return probHash[probID];
	}


	// API:

	function problemCount() {
		return probList.length;
	}


	// Locates a problem by ID, returning an index

	function findProblem(id) {
		for (var idx = 0, len = probList.length; idx < len; idx++) {
			if (probList[idx].id === id)
				return idx;
		}

		return -1;
	}


	// Locates a problem by problem ID, returning an index

	function findProblemID(id) {
		for (var idx = 0, len = probList.length; idx < len; idx++) {
			if (probList[idx].probID === id)
				return idx;
		}

		return -1;
	}


	// Locates all problems matching a given problem ID

	function findAllProblemID(id) {
		var out = [];

		for (var idx = 0, len = probList.length; idx < len; idx++) {
			if (probList[idx].probID === id)
				out.push(idx);
		}

		return out;
	}


	// API: Add a problem to the assignment
	//
	// Params: Problem ID, quantity
	//
	// NOTE: The problem must exist within the Problems bank
	//
	// Params:
	//   probID: Problem ID -- Required
	//   id: Instance ID (qp_id) -- Optional (if not specified, a unique ID will be generated)
	//   pts: Point value for the problem -- Optional (if not specified, it will use the problem default value)
	//   index: Location within the existing list to add the new problem -- Optional (if not specified, it will be added to the end of the list)

	function addProblem(addObj, preventSave) {
		var instanceID = addObj.id || TempID.get();
		var index = (addObj.index !== undefined) ? addObj.index : probList.length;

		// If a point value is passed in, use it. Otherwise use the default from the problem.
		var points = addObj.pts || ProblemHelper.get(addObj.probID).points;	// This only works because points can't be 0.

		var newProb = {
			id: instanceID,
			probID: addObj.probID,
			points: points - 0		// Ensure numeric conversion
		};

		probList.splice(index, 0, newProb);
		if (!preventSave) save();

		probHash[addObj.probID] = true;
		return true;
	}

	function getCount() {
		if (probList) {
			return probList.length;
		} else {
			return false;
		}
	}

	// Updates our internal cache of problem IDs

	function setExists(probID) {
		probHash[probID] = (findProblemID(probID) !== -1);
	}


	// Removes a problem instance from the model and adds an
	// appropriate action.

	function doRemove(id, probID, idx, preventSave) {
		probList.splice(idx, 1);
		if (!preventSave) save();
	}


	// Remove one problem, by ID

	function removeProblem(id) {
		// Locate the problems
		var idx = findProblem(id);
		if (idx < 0)		// Should be impossible, but be safe
			return false;

		doRemove(id, probList[idx].probID, idx);

		return true;
	}


	// API: Remove all instances of a given problem ID

	function removeProblemID(probID) {
		// Locate the problems
		var idxList = findAllProblemID(probID);
		if (idxList.length < 1)		// Should be impossible, but be safe
			return false;

		// Step through in reverse order since we'll be deleting as we go.
		for (var i = idxList.length - 1; i >= 0; i--) {
			var idx = idxList[i];
			var id = probList[idx].id;

			doRemove(id, probID, idx);
		}

		// Cleanup cache
		probHash[probID] = false;

		return true;
	}


	// API: Add or remove a problem, by problem ID
	//      Remove will remove all instances of the given ID.

	function toggleProblem(probID) {
		if (exists(probID)) {
			removeProblemID(probID);
		} else {
			return addProblem({probID: probID});
		}
	}


	// Returns a collapsed list of problems, i.e. each
	// problem ID only shows up once.

	function collapseList() {
		var collapsed = [];
		var probID = -1;
		for (var i = 0, len = probList.length; i < len; i++) {
			if (probList[i].probID !== probID) {
				collapsed.push([probList[i]]);
			} else {
				_.last(collapsed).push(probList[i]);
			}
			probID = probList[i].probID;
		}
		return collapsed;
	}


	// API: Move a problem from one index to another

	function moveProblem(from, to) {
		// Move a problem, and also any following problems with the same problem_ID

		// Collapse list
		var collapsed = collapseList();

		// Do move
		var old = collapsed[from];
		collapsed.splice(from, 1);		// Remove
		collapsed.splice(to, 0, old);	// Insert

		// Expand list
		probList = _.flatten(collapsed);

		// Transmit the new (world) order
		save();
	}


	// Formats a single problem for output

	function getOneProblem(entry, avoidSeeds) {
		var prob = angular.copy(ProblemHelper.get(entry.probID));
		prob.points = entry.points;		// Overwrites the default setting

		prob.probID = entry.probID;
		prob.id = entry.id;

		return prob;
	}


	// API: Get the unique list of problems (one instance per problem ID), with quantity
	//
	// This is very similar to collapseList(), but we want
	// a quantity instead of a subarray of instances.

	function getUnique() {
		var collapsed = [];
		var probID = -1;
		for (var i = 0, len = probList.length; i < len; i++) {
			if (probList[i].probID !== probID) {
				probID = probList[i].probID;
				var prob = getOneProblem(probList[i]);
				prob.qty = 1;
				collapsed.push(prob);
			} else {
				_.last(collapsed).qty++;
			}
		}

		return collapsed;
	}


	// API: Returns an entire assignment, including problems with
	// multiple instances.

	function getExpanded() {
		// Ironically, start with a collapsed list
		var list = collapseList();
		var out = [];

		for (var i = 0, len = list.length; i < len; i++) {
			// Generate a number of unique instances
			var probs = ProblemHelper.getInstances(list[i][0].probID, list[i].length);

			// Set the proper IDs for the problem instances (instance 2+)
			// getInstances() cloned the original ID
			for (var j = 1; j < list[i].length; j++)
				probs[j].id = list[i][j].id;

			// Merge problems into 'out'
			out.push.apply(out, probs);
		}

		return out;
	}


	function setQuantity(probID, qty, pts) {
		// Get the previous list
		var idxList = findAllProblemID(probID);
		var i;
		// Check for add, remove, or no change
		if (qty > idxList.length) {
			var toAdd = qty - idxList.length;
			for (i = 0; i < toAdd; i++) {
				addProblem({
					probID: probID,
					index: idxList[0],
					pts: pts
				}, true); // no save until finished; prevents issues with this service
			}
		} else if (qty < idxList.length) {
			// Remove problems
			var toDel = idxList.length - qty;
			// We should use removeProblem() but we can optimize by using a lower-level helper function.
			// This isn't necessarily good practice!
			// It does save potentially a huge amount of array scanning though.
			for (i = 0; i < toDel; i++) {
				doRemove(probList[idxList[0]].id, probID, idxList[0], true);	// Delete from the front, collapsing the list
			}
			// Update our cache (it doesn't occur in removeProblem for speed)
			setExists();
		}
		save();
	}


	// API: Set the point value for all instances of a given problem ID

	function setPoints(probID, pts) {
		var idxList = findAllProblemID(probID);

		// Iterate over matching problems, adjusting the point value for each
		if (idxList.length > 0) {
			for (var i = 0, len = idxList.length; i < len; i++) {
				var idx = idxList[i];
				var id = probList[idx].id;

				// Get the old value (for undo), and verify that it's actually different
				var old = probList[idx].points;
				if (pts === old)
					return;

				probList[idx].points = pts;

			}
			save();
		}
	}


	// Returns a list of standards matched by the current
	// assignment, filtered by types in the typeList.

	function getStandards(typeList) {
		var out = {};

		// Add an entry for each type to save time later
		for (var typeIdx = 0; typeIdx < typeList.length; typeIdx++)
			out[typeList[typeIdx]] = {};

		// Step through each problem, checking for matched standards
		for (var probIdx = 0, probLen = probList.length; probIdx < probLen; probIdx++) {
			var prob = ProblemHelper.get(probList[probIdx].probID);

			// Step through standards
			for (var stdIdx = 0, stdLen = prob.standards.length; stdIdx < stdLen; stdIdx++)	{
				if (typeList.indexOf(prob.standards[stdIdx].classid) !== -1)
					out[prob.standards[stdIdx].classid][prob.standards[stdIdx].code] = true;
			}
		}

		return out;
	}


	//

	function getData(isDistAdmin) {
		if (isDistAdmin) { // Assignments entered by district admin default to true.
			metaData.isShared = true;
		}
		return angular.copy(metaData);
	}


	// Common routine for modifying metadata

	function setMetaData(field, actName, value, dontSave) {
		var newData = {};
		newData[actName] = {aid: metaData.id, data: value};

		// Set our internal value
		metaData[field] = value;
		// Serialize
		if (!dontSave) {
			save();
		}
	}


	// Sets assignment name

	function setName(value, dontSave) {
		value = value || '';

		// The server can deal with proper sanitization.
		// Just enforce a max length
		if (value.length > maxLength)
			value = value.substring(0, maxLength);

		if (!value.length)
			dontSave = true;

		setMetaData('name', 'name', value, dontSave);
	}


	// Sets metadata

	function setMode(value) {
		// Validation
		if (['homework', 'quiz', 'test', 'ipractice'].indexOf(value) !== -1)
			setMetaData('mode', 'mode', value);
	}


	// Sets metadata

	function setDates(obj) {
		//if (obj.assigned)
		setMetaData('assigned', 'assigned', obj.assigned);
		if (obj.due === '') return;
		setMetaData('due', 'due', obj.due);
	}


	// Sets metadata

	function setSubmits(value) {
		value = parseInt(value, 10);

		// Must be a valid integer
		if (!isNaN(value) && (value > 0) && (value <= maxSubmits))
			setMetaData('submits', 'tries', value);
	}


	// Sets metadata

	function setScoring(value) {
		// Validation
		if (['full', 'deduct'].indexOf(value) !== -1)
			setMetaData('scoringMode', 'scoring', value);
	}


	// Sets metadata
	// This should perform validation as well!

	function setNotes(value) {
		value = value || '';

		// The server can deal with proper sanitization.
		// Just enforce a max length
		if (value.length > maxLength)
			value = value.substring(0, maxLength);

		setMetaData('notes', 'notes', value);
	}


	// Sets metadata
	// This should perform validation as well!

	function setStudentNotes(value) {
		value = value || '';

		// The server can deal with proper sanitization.
		// Just enforce a max length
		if (value.length > maxLength)
			value = value.substring(0, maxLength);

		setMetaData('studentNotes', 'studentNotes', value);
	}


	// Sets metadata

	function setSharing(value) {
		setMetaData('isShared', 'share', value);
	}

	function setTeacher(value) {
		setMetaData('teacherID', 'teacherID', value);
	}

	function setHasSubmissions(flag) {
		var hasSubmissions = Assignment.getHasSubmissions();
		metaData.hasSubmissions = flag && !!hasSubmissions[metaData.id];
	}

	function setPresentationData(data) {
		metaData.presentationData = data;
		save();
	}

	function setID(id) {
		metaData.id = id;
	}

	// Generate date for assigned or due. If input is blank or null, return empty string.
	function assignRosterDate(date) {
		var dt = date ? new Date(date) : '';
		return dt;
	}
	// Sets metadata

	function setRoster(obj) {
		if (!obj) {
			obj = {
				isSubAssign: false,
				subSetAssigned: []
			};
		}
		var noSave = true;
		// Not sure why the Roster sets assigned and due dates to null. I believe there was a reason?
		//setMetaData('assigned', 'assigned', null, noSave);
		//setMetaData('due', 'due', null, noSave);
		setMetaData('isSubAssign', 'isSubAssign', obj.isSubAssign, noSave);
		setMetaData('subSetAssigned', 'subSetAssigned', obj.subSetAssigned || []);
	}

	function addRosterDates(State, assignData) {
		var defaultAssigned = assignRosterDate(assignData.assigned);
		var defaultDue = assignRosterDate(assignData.due);
		var roster = State.get('roster');

		var promises = [];
		roster.forEach((item) => {
			if (!item.assigned) item.assigned = defaultAssigned;
			if (!item.due) item.due = defaultDue;
			let p = Assignment.getStudentInstance(metaData.id, item.id).then(
				(res) => {
					item.assigned = assignRosterDate(res.assigned);
					item.due = assignRosterDate(res.due);
					return item;
				},
				(err) => {
					return item;
				});
			promises.push(p);
		});
		return Promise.all(promises).then((res) => {
		/*
			res.map((row) => {
				row.assigned = row.assigned ? row.assigned : defaultAssigned;
				row.due = row.due ? row.due : defaultDue;
			});
			*/
			State.set('roster', roster);
		});
	}

	// Save spacing between problems.
	function adjustSpacing(probId, spacers) {
		var presentation = metaData.presentationData || {};
		if (!presentation.preview_spacing) presentation.preview_spacing = {};
		presentation.preview_spacing[probId] = spacers;
		metaData.presentationData = presentation;
		save();
	}

	function getId() {
		return metaData.id;
	}

	function load(id) {
		self.loadInProgress = true;
		return Assignment.getById(id).then(setCourse)
			.then(
			loadSuccess,
			() => { self.loadInProgress = false;
		});
	}

	// Added to allow tab options to redirect. Currently unused. Probably delete.
	function redirectIfNotMine(user_id) {
		var redir = null;
		// This pairs with settings perpetrated in the list controller.
		// $rootScope.assignGen.customWizardTabs: initially used for linking from Shared Assignments; can, however, be used for other customizations.
		// $rootScope.assignGen.readonly: if the logged in teacher didn't author this assignment, s/he has readonly access only.
		if ($rootScope.assignGen === undefined) {
			redir = 'assignApp.list';
		} else if ($rootScope.assignGen.customWizardTabs) {
			delete $rootScope.assignGen.customWizardTabs;
			redir = 'assignGenApp.edit';
		} else if (getData().teacherID !== user_id) {
			redir = 'assignGenApp.edit';
		}

		if (redir) {
			if ($rootScope.assignGen) {
				$rootScope.assignGen.edit = true;
				$state.go(redir, { id: getId() });
			} else {
				$state.go(redir);
			}
		}
	}

	// Detect assignment read-only mode. Trigger if from Assignment Library (customWizardTabs set)
	// Trigger also if teacherId != logged in user_id. This will be the case if the user refreshed
	// the page after having linked from Assignment Library.
	function isReadOnly(user_id) {
		var result = false;
		// This pairs with settings perpetrated in the list controller.
		// $rootScope.assignGen.customWizardTabs: initially used for linking from Shared Assignments; can, however, be used for other customizations.
		// $rootScope.assignGen.readonly: if the logged in teacher didn't author this assignment, s/he has readonly access only.
		if ($rootScope.assignGen && $rootScope.assignGen.customWizardTabs) {
			result = $rootScope.assignGen.readonly;
			// And once the readonly flag has been set, clear the customWizardTabs flag.
			delete $rootScope.assignGen.customWizardTabs;
		} else {
			var teacherId = getData().teacherID;
			result = teacherId && teacherId !== user_id;
		}

		if (result) {
			initNew();
			$rootScope.$broadcast('AssignmentGenerator:hide-tabs');
		}
		return result;
	}

	self.isLoading = function()
	{
		return self.loadInProgress;
	};


	// Start with fresh problem list for each assignment.
	function initProblemList() {
		ProblemHelper.initProbBank();
		probList = [];
		probHash = {};
		transList = {};
	}

	function loadSuccess(data) {
		canSave = false;
		initNew();
		setID(data.id);  // Set the ID only after we've gotten the assignment data from the server.
		// Add metadata -- Validate!
		setName(data.name);
		setMode(data.mode);
		setSubmits(data.submissions);
		setScoring(data.scoring);
		setNotes(data.description);
		setDates(data);
		setStudentNotes(data.notes);
		setSharing(data.sharing || false);
		setTeacher(data.teacherID);
		setHasSubmissions(true);
		setPresentationData(data.presentation_data);
		setRoster(data);

		initProblemList();
		// Add problems
		for (var i = 0, len = data.problems.length; i < len; i++) {
			var prob = data.problems[i];
			ProblemHelper.add(prob);
			addProblem({
				id: prob.id,
				probID: prob.probID,
				pts: prob.points,
				idx: i + 1
			});
		}

		canSave = true;
		self.loadInProgress = false;
	}

	// This is to fix the issue of reverting to the first course in the list if a page refresh is performed.
	// Since the course ID is included in the assignment data, it can be used to retrieve the course object
	// associated with that assignment and set the active course.
	function setCourse(data) {
		var courseID = data.courseID;
		var curCourse = AppState.get('curCourse');
//		var courses = AppState.get('courses');
		var courses = AppState.filteredCourses();
		var course = courses.filter((item) => { return item.id === courseID; });
		course = course[0];
		return new Promise((resolve, reject) => {
			if (courseID !== curCourse.id) {
				Course.setById(courseID).then((res) => {
					if (course) {
						var result = _.extend(course, res);
						AppState.set('curCourse', result);
						$rootScope.$broadcast('class change', result);
					}
					resolve(data);
				});
			} else {
				resolve(data);
			}
		});
	}

	// function catchDuplicateSave(data) {
	// 	var isDuplicate = false;
	// 	if (data.id.charAt(0) === '_' && data.id === lastDataId) {
	// 		saveAttemptBuffer = data;
	// 		isDuplicate = true;
	// 	}
	// 	return isDuplicate;
	// }
	//
	// function clearDuplicateSaveBuffer(data, aid) {
	// 	if (saveAttemptBuffer) {
	// 		data.mode = saveAttemptBuffer.mode;
	// 		data.id = aid;
	// 		saveAttemptBuffer = null;
	// 		Assignment.save([data]);
	// 	}
	// }

	// Save the assignment

	function save() {
		// Don't do anything if saving is disabled
		if (!canSave)
			return;

		// Format the data
		var data = {
			id: metaData.id,
			name: metaData.name,
			mode: metaData.mode,
			assigned: metaData.assigned,
			due: metaData.due,
			submissions: metaData.submits,
			scoring: metaData.scoringMode,
			description: metaData.notes,
			notes: metaData.studentNotes,
			sharing: metaData.isShared,
			isSubAssign: metaData.isSubAssign,
			subSetAssigned: metaData.subSetAssigned,
			probs: []
		};
		_.forEach(probList, function(prob) {
			data.probs.push({
				id: prob.id,
				pid: prob.probID,
				pts: prob.points
			});
		});

		if (metaData.presentationData) {
			data.presentation_data = metaData.presentationData;
		}

		if (data.name.length > 0) {	// Save assignment only if there's an entry in the name field.
			// if (catchDuplicateSave(data) === false) {
				$rootScope.$broadcast('wizard save start');
				Assignment.save([data]).then((res) => {
					if (_.has(res, 'aid') && res.aid) {
/*
						var curId = getId();
						// clearDuplicateSaveBuffer(data, res.aid);
						setID(res.aid);
						if (curId.charAt(0) === '_') {
							isNewAssignment = true;
						}
						var stateOptions = isNewAssignment ? {} : { id: res.aid };
*/
						// Commented out the above "isNewAssignment" code, which was preventing the new assignment ID from showing
						// immediately in the browser location bar. This allows the class name dropdown to change to a label and
						// also allows navigation directly to the Students tab, if available.
						// It is unclear why the isNewAssignment flag was added, so it's possible we'll need to restore it.
						setID(res.aid);
						var stateOptions = { id: res.aid };
						$state.go($state.current.name, stateOptions);
					}
					$rootScope.$broadcast('wizard save end');
				}, () => { $rootScope.$broadcast('wizard save end'); });
			// }
			lastDataId = data.id;
		}
	}

	function zeroPad(n) {
		n = '0' + n;
		return n.substr(n.length - 2);
	}

	function formatDate(ymd) {
		var fmt = '';
		var dt = new Date(ymd);
		var yr = dt.getFullYear();
		var mo = zeroPad(1 + dt.getMonth());
		var da = zeroPad(dt.getDate());
		var hr = zeroPad(dt.getHours());
		var mn = zeroPad(dt.getMinutes());
		fmt = `${mo}-${da}-${yr} ${hr}:${mn}`;
		return fmt;
	}

	// Public API
	return {
		addProblem: addProblem,
		toggleProblem: toggleProblem,
		removeProblem: removeProblemID,
		moveProblem: moveProblem,		// Move a problem from one index to another
		setQuantity: setQuantity,
		setPoints: setPoints,
		exists: exists,					// Does a given problem ID exist in the assignment?
		problemCount: problemCount,
		initNew: initNew,
		getCollapsed: getUnique,
		getExpanded: getExpanded,		// Returns an entire assignment, including problems with multiple instances.
		getStandards: getStandards,
		getCount: getCount, // count of added problems
		getData: getData,
		setID: setID,			// Assignment ID
		getId: getId,
		setName: setName,		// Sets assignment name
		setMode: setMode,		// Assignment mode
		setDates: setDates,		// Assigned and Due dates
		setSubmits: setSubmits,	// Submission count
		setScoring: setScoring,	// Scoring method
		setNotes: setNotes,		// Teacher notes
		setStudentNotes: setStudentNotes, // Student notes
		setSharing: setSharing,	// Sharing status
		setRoster: setRoster, // Roster for sub assignments
		load: load,				// Load an assignment
		isReadOnly: isReadOnly,
		redirectIfNotMine: redirectIfNotMine,
		addRosterDates: addRosterDates,
		adjustSpacing: adjustSpacing,
		formatDate: formatDate,
		isLoading: self.isLoading,	// Check to see if a load is in progress
		setAssignmentData:setPresentationData
	};

};
