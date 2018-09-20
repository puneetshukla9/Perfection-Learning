'use strict';

export default function (AppState, $state, $rootScope, Preferences, Wizard,
	Calendar, AssignmentHelper, DateConvert, State, PubSub, $scope, CalendarHelper, $http) {

	var self = this;
	var $ = require('jquery');
	AssignmentHelper.isReadOnly(AppState.get('user_id'));

	self.isAMSCO = AppState.get('curCourse').product === 'amsco';
	self.due = new Date();
	self.calendar = Calendar;
	self.isDistAdmin = AppState.get('isDistAdmin');

	$rootScope.assignGen = $rootScope.assignGen || {};

	if ($state.params.id) {
		AssignmentHelper.load($state.params.id).then(() => { refreshPage(); });
		$scope.className = ' '; // Initialize className to blank, to be filled in by refreshPage()
	} else {
		$rootScope.assignGen.edit = false;
		self.hasAssignmentId = false;
		AssignmentHelper.initNew();
		State.set('choose', undefined);
	}

	self.checkValid = function (name, category) {
		var result = !!(name && category);
		if (!result) {
			$rootScope.assignGen.detailsValid = false;
			$rootScope.assignGen.printValid = false;
			$rootScope.assignGen.chooseValid = false;
		} else {
			$rootScope.assignGen.detailsValid = true;
		}
	};

	self.modes = {
		homework: { name: 'Homework', tries: true, instruct: 'Students are allowed multiple tries per problem and can access videos and step-by-step help.' },
		quiz: { name: 'Quiz', tries: true, instruct: 'Students are allowed multiple tries per problem, but cannot access videos or step-by-step help.' },
		test: { name: 'Test', instruct: 'Students are allowed one try per problem and cannot access videos or step-by-step help.' },
		ipractice: {
			name: 'i-Practice', instruct: 'Students are allowed to keep trying until ' +
				'they\'ve mastered the problem with access to videos and step-by-step help.', oneSub: true
		}
	};

	self.buttonBarConfig = {
		show: true,
		now: { show: true, text: 'Now' },
		today: { show: true, text: 'Today' },
		clear: { show: false, text: 'Clear' },
		date: { show: true, text: 'Date' },
		time: { show: true, text: 'Time' },
		close: { show: true, text: 'Close' }
	};

	self.tries = [];
	var maxTries = 10; // per Jesse. (Is this value used anywhere else?)
	for (var i = 1; i <= maxTries; i++)
		self.tries.push({ text: i, setting: i });

	self.assignedToOpts = [{ text: 'All students', setting: false }, { text: 'Subset of students', setting: true }];

	self.scoringOptions = [
		{ text: 'Full points are awarded, regardless of number of submissions', setting: 'full' },
		{ text: 'Deduct points for each submission after the first', setting: 'deduct' }
	];

	self.sharingOptions = [
		{ text: 'Only I can use this assignment', setting: false },
		{ text: 'Share this assignment with other teachers in my school', setting: true }
	];

	self.showTries = showTries;

	self.showScoring = showScoring;

	self.setDates = setDates;

	self.showStudentNotes = showStudentNotes;

	function setDates() {
		var result = false;
		if (!self.isAMSCO) result = true;

		return result;
	}

	self.toggle = toggle;


	function showTries() {
		var result = false;
		if (!self.isAMSCO && self.modes[self.curMode].tries) result = true;

		return result;
	}

	function showScoring() {
		var result = false;
		if (!self.isAMSCO && self.modes[self.curMode].scoring) result = true;

		return result;
	}

	function showStudentNotes() {
		var result = false;
		if (!self.isAMSCO) result = true;

		return result;
	}

	PubSub.subscribe('assignLoaded', refreshPage, $scope);

	populateForm();
	initStandards();

	self.prefs = {
		leadTime: Preferences.get('leadTime') || 3,
		defaultAssigned: Preferences.get('defAssign'),
		defaultDue: Preferences.get('defDue'),
		useDefault: Preferences.get('autoAssignDate')
	};

	var pickAssignedDate = function (dueDate) {
		// If a due date is set, base the assigned date on it
		if (dueDate) {
			var out = dueDate.getTime();
			out -= 1000 * 60 * 60 * 24 * self.prefs.leadTime;		// Go back leadTime days
			return new Date(out);
		}
		// If a due date is NOT set, use today for the assigned date
		return new Date();
	};

	self.updateDate = (assignment) => {
		var result = CalendarHelper.validate(assignment.assigned, assignment.due);
		if (result.assigned) {
			self.assigned = result.assigned === undefined ? '' : new Date(result.assigned);
		}
		if (result.due) {
			self.due = result.due === undefined ? '' : new Date(result.due);
		}
		AssignmentHelper.setDates(result);
	};

	self.opened = [];
	self.today = new Date();

	function toggle(event, index) {
		event.preventDefault();
		event.stopPropagation();
		self.opened[index] = !self.opened[index];
	}

	function refreshPage() {
		$scope.className = AppState.get('curCourse').name;

		populateForm();
		initStandards();
		$scope.hasAssignmentId = self.id;
	}

	function populateForm() {
		var assignData = AssignmentHelper.getData(self.isDistAdmin);
		console.log(assignData);
		self.id = assignData.id;
		self.name = assignData.name;
		self.curMode = assignData.mode;
		self.assigned = assignData.assigned === undefined ? '' : new Date(assignData.assigned);
		self.due = assignData.due === undefined ? '' : new Date(assignData.due);
		self.submissions = assignData.submits;
		self.isSubAssign = assignData.isSubAssign;
		self.subSetAssigned = assignData.subSetAssigned;
		self.notes = assignData.notes;
		self.studentNotes = assignData.studentNotes;
		self.scoring = assignData.scoringMode;
		self.sharing = assignData.isShared;
		self.checkValid(self.name, self.curMode);
		if (assignData.assignType != "") {
			self.engage = assignData.assignType;
		}

	}

	function initStandards() {
		var showStds = AppState.get('showStds');
		var stdDefs = AppState.get('stdList');
		var stds = AssignmentHelper.getStandards(showStds);
		self.standardTypes = [];

		// Create a list of shown standards
		for (var showIdx = 0; showIdx < showStds.length; showIdx++) {
			for (var stdIdx = 0; stdIdx < stdDefs.length; stdIdx++) {
				var id = stdDefs[stdIdx].id;
				/* tslint:disable-next-line */
				if ((showStds[showIdx] == id) && (Object.keys(stds[id]).length > 0)) {
					// Types may not match. Use == instead of ===
					self.standardTypes.push({
						name: stdDefs[stdIdx].title,
						list: stds[id]
					});
					break;
				}
			}
		}

		self.stdNote = '';
		if (self.standardTypes.length === 0) {
			if (AssignmentHelper.problemCount() === 0) {
				self.stdNote = 'You have not added problems to this assignment.' +
					' Add problems to the assignment to see which standards are met by this assignment.';
			} else {
				self.stdNote = 'There are no problems with standards in this assignment.';
			}
		} else {
			self.stdNode = 'Should have populated standards list';
		}
	}

	self.getInstruct = function (mode) {
		return (self.modes[mode] && self.modes[mode].instruct) || '';
	};

	self.subsDisabled = function () {
		var disabled = self.modes[self.curMode].oneSub;
		if (disabled)
			self.submissions = 1;
		return disabled;
	};

	self.setName = function () {
		AssignmentHelper.setName(self.name);
	};

	// Allow entry of new assignment name with the Enter key.
	self.captureEnter = function (evt) {
		if (evt.keyCode !== 13 || self.hasAssignmentId) return false;

		self.hasAssignmentId = true;
		self.checkValid(self.name, self.curMode);
		self.setName();
	};

	function setNameUI() {
		AssignmentHelper.setName(self.name, true);
	}

	self.setNameUI = function () {
		setNameUI();
	};

	self.setMode = function () {
		AssignmentHelper.setMode(self.curMode);
		checkSubmissionsAdjustment();
	};

	self.setSubmits = function () {
		AssignmentHelper.setSubmits(self.submissions);
	};

	self.setScoring = function () {
		AssignmentHelper.setScoring(self.scoring);
	};

	self.setNotes = function () {
		AssignmentHelper.setNotes(self.notes);
	};

	self.setStudentNotes = function () {
		AssignmentHelper.setStudentNotes(self.studentNotes);
	};

	self.setSharing = function () {
		AssignmentHelper.setSharing(self.sharing);
	};


	// Convert an array to a string filled with non-wrapping sections

	self.formatStandards = function (list) {
		var stds = Object.keys(list).sort(_std_sort);
		list = _.map(stds, function (key) { return '<span class="noWrap">' + key + '</span>'; });
		return list.join(', ');
	};


	// Check for need to adjust number of tries; e.g., based on assignment type
	function checkSubmissionsAdjustment() {
		if (self.curMode === 'test') {
			self.submissions = 1;
			self.setSubmits();
		}
	}

	// Sort standards

	function _std_sort(a, b) {
		var std1 = _std_parse(a);
		var std2 = _std_parse(b);
		var result = std1 && std2 ? _std_compare(std1, std2) : 0;
		return result;
	}


	// Parse standard code; e.g., APR-1 3a:
	// main: APR-1
	// num: 3
	// sub: a

	function _std_parse(str) {
		var stdRe = /^(\S+)[\s\.]+(\d+)(.+)?$/;
		var parts = stdRe.exec(str);
		if (parts) {
			return {
				main: parts[1],
				num: parts[2],
				sub: parts[3]
			};
		} else {
			return null;
		}
	}


	// Compare parsed standard codes

	function _std_compare(std1, std2) {
		var result;
		if (std1.main < std2.main) {
			result = -1;
		} else if (std1.main > std2.main) {
			result = 1;
		} else if (std1.num * 1 < std2.num * 1) {
			result = -1;
		} else if (std1.num * 1 > std2.num * 1) {
			result = 1;
		} else if (!std1.sub || std1.sub < std2.sub) {
			result = -1;
		} else {
			result = 1;
		}
		return result;
	}

	//Mitr Code added by puneet
	self.engage = "itemBasedAssignment";

	var _interval = setInterval(function () {
		$(".accordianHeading").off("click").on("click", function () {
			var id = $(this).attr('data-target');
			if (!$(id).hasClass('open')) {
				$('#accordionWrapper .collapse').removeClass('open').slideUp();
				$(id).addClass('open').slideDown();
			} else {
				$(id).removeClass('open').slideUp();
			}
		});
		$(".accordianSubHeading").off("click").on("click", function () {
			var id = $(this).attr('data-target');
			if (!$(id).hasClass('open')) {
				$('#accordionWrapper .sub_collapse').removeClass('open').slideUp();
				$(id).addClass('open').slideDown();
			} else {
				$(id).removeClass('open').slideUp();
			}
		});
		if ($(".accordianHeading").length && $(".accordianSubHeading").lenght) {
			clearInterval(_interval);
		}
	}, 100);
	self.homeworkChange = function () {
		setTimeout(function () {
			$(".accordianHeading").off("click").on("click", function () {
				var id = $(this).attr('data-target');
				if (!$(id).hasClass('open')) {
					$('#accordionWrapper .collapse').removeClass('open').slideUp();
					$(id).addClass('open').slideDown();
				} else {
					$(id).removeClass('open').slideUp();
				}
			});
			$(".accordianSubHeading").off("click").on("click", function () {
				var id = $(this).attr('data-target');
				if (!$(id).hasClass('open')) {
					$('#accordionWrapper .sub_collapse').removeClass('open').slideUp();
					$(id).addClass('open').slideDown();
				} else {
					$(id).removeClass('open').slideUp();
				}
			});

		});
		AssignmentHelper.setAssignType(self.engage);
	}

	//self.fOwOptions = [{ "index": 0, "text": "- Select Form of Writing - " }, { "index": 1, "text": "Haiku" }, { "index": 2, "text": "Limerick" }, { "index": 3, "text": "Diamante" }, { "index": 4, "text": "Friendly Letter" }, { "index": 5, "text": "Business Letter" }, { "index": 6, "text": "Personal Narrative" }, { "index": 7, "text": "Short Story" }, { "index": 8, "text": "Cause/Effect Essay" }, { "index": 9, "text": "Compare/Contrast Essay" }, { "index": 10, "text": "Problem/Solution Essay" }, { "index": 11, "text": "How-to Essay" }, { "index": 12, "text": "Summary" }, { "index": 13, "text": "Book Review" }, { "index": 14, "text": "Research Report" }, { "index": 15, "text": "Describe a Person Essay" }, { "index": 16, "text": "Describe a Place Essay" }, { "index": 17, "text": "Describe an Object Essay" }, { "index": 18, "text": "Describe an Event Essay" }, { "index": 19, "text": "Persuasive Paragraph" }, { "index": 20, "text": "Persuasive Essay" }, { "index": 21, "text": "Timed Writing" }, { "index": 22, "text": "Other" }]
	//self.formOfWriting = self.fOwOptions[0];
	self.template = [{
		text: "Essential Guide"
	}, {
		text: "Texas Middle School"
	}, {
		text: "Plano School District Middle"
	}, {
		text: "Add New Template"
	}]
	self.hasAssignmentId = true;
	self.assignmentData = {
		"orgStrategies": [],
		"collaboration": [],
		"studentSelfAssessment": {},
		"planOrg": true,
		"writeFirst": true,
		"evaluate": true,
		"share": true,
		"publish": true,
		"planOrgPoint": "",
		"writeFirstPoint": "",
		"evaluatePoint": "",
		"sharePoint": "",
		"publishPoint": "",
		"title": "",
		"purpose": "",
		"audience": "",
		"instruction": "",
		"teacherSelect": true,
		"formOfWriting": ''

	};
	self.TemplateModel = self.template[0];

	var rawData = {};
	$http.get("./app/modules/assignment-generator/config/createAssign.json").then(function (response) {
		rawData = response.data;
		self.fOwOptions =rawData["formOfWriting"];
		self.assignmentData.formOfWriting=rawData["formOfWriting"][0];
		

	});

	self.setFow = function () {
		self.homeworkChange();
		self.assignmentData.orgStrategies = rawData["organizationStrategies"][self.assignmentData.formOfWriting.index].options;
		self.assignmentData.collaboration = rawData["collaboration"][self.assignmentData.formOfWriting.index].options
		self.assignmentData.studentSelfAssessment = rawData["studentSelfAssessment"][self.assignmentData.formOfWriting.index];
		createOrganizationMasterData();
	}
	function createOrganizationMasterData() {
		self.organizationMasterData =angular.copy(rawData["organizationMasterData"]);
		var temp;
		for(var j in self.organizationMasterData){
		for(var i in self.assignmentData.orgStrategies){
			
				if(self.organizationMasterData[j].value == self.assignmentData.orgStrategies[i].value){
					self.organizationMasterData[j].checked=true;
				}
			
			}
		}
	}

	self.showOrganiztionPopup = function (e) {

		$('.wizard-fullscreen').css("z-index", "1050");
		$('.organizationalModal').show().addClass('fade in');
		$('body').css("overflow", "hidden");
		e.stopPropagation();
	}
	self.updateOrganizeData = function () {
		self.assignmentData.orgStrategies = [];
		for (var i in self.organizationMasterData) {
			if (self.organizationMasterData[i].checked) {
				self.assignmentData.orgStrategies.push(angular.copy(self.organizationMasterData[i]));
			}

		}
		self.closePopup();
	}
	self.collaborationCustomQues = {
		"value": "",
		checked: true,
		custom: true,
		type: "check",
		edit: false,
		editValue: ""
	};
	self.customQues = {
		qText: "",
		type: "check",
		custom: true,
		edit: false,
		editValue: "",
		options: [{
			"value": "Evaluate & Revise",
			"ans": true
		},
		{
			"value": "Share & Edit",
			"ans": true
		},
		{
			"value": "Publish",
			"ans": true
		}]
	}
	self.addCustomQuest = function (type, subtype) {
		if (typeof subtype == "undefined") {
			self.collaborationCustomQues.editValue = self.collaborationCustomQues.value
			self.assignmentData[type].push(self.collaborationCustomQues);
			self.collaborationCustomQues = {
				"value": "",
				checked: true,
				custom: true,
				type: "check",
				edit: false,
				editValue: ""
			};

		} else {
			self.customQues.editValue = self.customQues.qText;
			self.assignmentData[type][subtype].push(self.customQues);
			self.customQues = {
				qText: "",
				type: "check",
				custom: true,
				edit: false,
				editValue: "",
				options: [{
					"value": "Evaluate & Revise",
					"ans": true
				},
				{
					"value": "Share & Edit",
					"ans": true
				},
				{
					"value": "Publish",
					"ans": true
				}]
			}

		}


	}
	self.editCustomQuest = function (type, subtype, index) {
		if (typeof subtype == "undefined" || subtype == "") {
			self.assignmentData[type][index].edit = true;
		} else {
			self.assignmentData[type][subtype][index].edit = true;

		}
	}
	self.cancelCustomQuest = function (type, subtype, index) {
		if (typeof subtype == "undefined" || subtype == "") {
			self.assignmentData[type][index].editValue = angular.copy(self.assignmentData[type][index].value);
			self.assignmentData[type][index].edit = false;
		} else {
			self.assignmentData[type][subtype][index].editValue = angular.copy(self.assignmentData[type][subtype][index].qText);
			self.assignmentData[type][subtype][index].edit = false;

		}
	}
	self.updateCustomQuest = function (type, subtype, index) {
		if (typeof subtype == "undefined" || subtype == "") {
			self.assignmentData[type][index].value = angular.copy(self.assignmentData[type][index].editValue);
			self.assignmentData[type][index].editValue = angular.copy(self.assignmentData[type][index].value);
			self.assignmentData[type][index].edit = false;
		} else {
			self.assignmentData[type][subtype][index].qText = angular.copy(self.assignmentData[type][subtype][index].editValue);
			self.assignmentData[type][subtype][index].editValue = angular.copy(self.assignmentData[type][subtype][index].qText);
			self.assignmentData[type][subtype][index].edit = false;

		}
	}
	self.deleteCustomQuest = function (type, subtype, index) {
		if (typeof subtype == "undefined" || subtype == "") {
			self.assignmentData[type].splice(index, 1);
		} else {
			self.assignmentData[type][subtype].splice(index, 1);

		}
	}
	self.topicChoice = {
		"assignAudience": [{
			label: "classmate",
			isCheck: false
		}, {
			label: "adults",
			isCheck: false
		}, {
			label: "self intrest groups",
			isCheck: false
		}, {
			label: "self",
			isCheck: false
		}, {
			label: "your children",
			isCheck: false
		}, {
			label: "ederly",
			isCheck: false
		}, {
			label: "family",
			isCheck: false
		}, {
			label: "buisness",
			isCheck: false
		}, {
			label: "teen",
			isCheck: false
		}, {
			label: "teacher",
			isCheck: false
		}, {
			label: "contest",
			isCheck: false
		}, {
			label: "other",
			isCheck: false
		}],
		"assignPurpose": [{
			label: "inform/explain",
			isCheck: false
		}, {
			label: "entertain/create",
			isCheck: false
		}, {
			label: "persuade/argue",
			isCheck: false
		}, {
			label: "express/reflect",
			isCheck: false
		}]
	}
	self.showPopup = function () {
		$('.wizard-fullscreen').css("z-index", "1050");
		$('.choiceWrapper').show().addClass('fade in');
		$('body').css("overflow", "hidden");

	}
	self.closePopup = function () {
		$('.wizard-fullscreen').css("z-index", "");
		$('.detailsModalWrapper').removeClass('fade in').hide();
		$('body').css("overflow", "auto");
	}
	self.updateTotal = function () {
		self.assignmentData.totalPoint = Number(self.assignmentData.publishPoint) + Number(self.assignmentData.sharePoint) + Number(self.assignmentData.evaluatePoint) + Number(self.assignmentData.writeFirstPoint) + Number(self.assignmentData.planOrgPoint)
	}
	self.validateScore =function(e){
		var updatedValue = e.target.value + e.key;
		if ((Number(updatedValue) > Number(99)) && e.keyCode != 8 && e.keyCode != 46 && e.keyCode != 17 && e.keyCode != 65) {
			e.preventDefault();
		}
	}
};
