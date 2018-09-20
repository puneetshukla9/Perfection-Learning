'use strict';

export default function (Problems, Assignment, Preferences, State, PubSub, Hotkey, $state, $stateParams, $scope, $http) {

	var self = this;
	var scoreFmt = 'pts';
	var $ = require('jquery');
	var curFilter;
	var pendingCount;
	var inProgressCount;
	var scoreObj = { score: 0, scoreMax: 0 };
	$scope.curFilter = 'All';
	$scope.loading = true;
	$scope.showQuestions = Preferences.get('showQuestions');
	$scope.showStandards = Preferences.get('showStandards');

	if ($state.params.assign) {
		Problems.reset();
	} else {
		$state.go('assignApp.list');
	}

	var problemRubricPoints = {};
	// Listen for the send-rubric-points signal emitted from the rubric-item directive.
	// When this is received, broadcast the data down to the change-points-directive.
	$scope.$on('send-rubric-points', function (discard, data) {
		let id = parseInt(data.problem.id, 10);
		let probID = parseInt(data.problem.probID, 10);
		if (!problemRubricPoints[probID]) { problemRubricPoints[probID] = {}; }
		problemRubricPoints[probID][data.name] = parseInt(data.points, 10);
		Problems.setRubricPoints(id, problemRubricPoints[probID]);
		$scope.$broadcast('receive-rubric-points:' + probID, data);
	});

	$scope.$on('preferences changed', optChangePrefs);
	PubSub.subscribe('updateScore', showScore);

	Hotkey.set('showIDs', $scope);
	self.doShowIDs = Hotkey.get('showIDs');

	$scope.setFilter = function (val) {
		curFilter = val;
		if (val === 'All') {
			State.set('pendFilter', false);
			State.set('unansweredFilter', false);
		} else if (val === 'Grading required') {
			State.set('pendFilter', true);
		} else if (val === 'In progress') {
			State.set('unansweredFilter', true);
		}
		$scope.curFilter = val;
	};


	var iconList = {
		homework: 'icon-h',
		quiz: 'icon-q',
		test: 'icon-t',
		ipractice: 'icon-p',
		'default': 'icon-h'
	};

	$scope.filterList = [
		{ label: 'All', show: true },
		{ label: 'Grading required', show: true },
		{ label: 'In progress', show: true }
	];

	$scope.toggleFmt = function () {
		scoreFmt = scoreFmt === 'pts' ? 'pct' : 'pts';
		showScore();
	};

	function showScore() {
		var fmtScore = '';
		if (scoreFmt === 'pts') {
			fmtScore = scoreObj.score + ' / ' + scoreObj.scoreMax;
		} else {
			fmtScore = (Math.round(scoreObj.score / scoreObj.scoreMax * 100)) + '%';
		}
		$scope.fmtScore = fmtScore;
	}

	function removeFilter(label) {
		$scope.filterList.forEach(function (item, ndx) {
			if (item.label === label) $scope.filterList[ndx].show = false;
		});
	}

	function optChangePrefs(e, state) {
		$scope.showQuestions = state.showQuestions;
		$scope.showStandards = state.showStandards;
	}

	var modeData = {
		assign: {},
		assignStudent: { oneStudent: true },
		pendAssign: { pendingOnly: true },
		pendAssignStudent: { oneStudent: true, pendingOnly: true }
	};

	var assignID = $stateParams.assign;
	var studentID = $stateParams.student;

	var init = function () {
		var curState = $state.current.name;		// assign, assignStudent, pendAssign, pendAssignStudent
		var curStateArr = curState.split('.');
		self.mode = curStateArr[curStateArr.length - 1];
		self.modeConfig = modeData[self.mode] || modeData.assign;
		self.loading = true;
		if (self.mode === 'pendingAssign') {
			Assignment.getPending(assignID).then(dataLoaded);
		} else if (self.mode === 'assignStudent') {
			Assignment.getStudent(assignID, studentID).then(dataLoaded);
		}
	};

	init();

	self.filterQs = function (prob) {
		if (State.get('pendFilter')) {
			return !prob.showPend;
		} else if (State.get('unansweredFilter')) {
			return !prob.isInProgress;
			//return (State.get('pendFilter') && !prob.showPend);
		}
	};

	self.setPoints = function (prob, isValid, partIdx) {
		if (partIdx === undefined) partIdx = -1;
		// Prevent saving of points greater than max. This is to keep Reports from exceeding 100%.
		if (!isValid || isNaN(prob.pts) || prob.pts > prob.scoreMax)
			return;

		var oldPend = prob.showPend;

		prob = Problems.setPoints(prob.id, prob.pts, partIdx);

		if (!prob)
			return;

		// Update sandbox
		prob.pts = prob.score;
		prob.showPend = oldPend;

		// Update internal model
		var idx = prob.id;			// Slightly iffy. This is a bold assumption.
		self.problems[idx] = prob; // Prop is a clone of self.problems[idx], so we have to update it. It feels like we could end up with a memory leak here.
	};

	self.getIcon = function (prob) {
		// Amazingly, this gets called 5 times per problem on page init
		// It's called once per change or blur, for every single problem
		var map = {
			pending: 'error',
			correct: 'check_circle',
			'new': 'schedule',
			incorrect: 'cancel',

			'default': 'cancel'
		};
		var status;
		if (!prob.isPastDue) {
			status = prob.status && prob.status.toLowerCase && prob.status.toLowerCase();
		} else if (prob.status === 'correct' || prob.status === 'pending') {
			status = prob.status.toLowerCase && prob.status.toLowerCase();
		} else {
			status = '';
		}
		return map[status] || map['default'];
	};

	$scope.assignmentIcon = function (type) {
		return (iconList[type] || iconList['default']);
	};


	function dataLoaded(data) {
		// PubSub.publish('status', {act: 'clear'});
		self.loading = false;

		// Store data to the model (and get the translated data back)
		Problems.reset();
		self.problems = Problems.set(data);
		self.title = self.problems[0].assign;
		self.type = self.problems[0].type;
		self.userName = self.problems[0].uname.first + ' ' + self.problems[0].uname.last;
		self.capitalType = self.problems[0].capitalType;
		// Count Pending problems, set total; set default display
		pendingCount = Problems.pendingCount();
		inProgressCount = Problems.inProgressCount();
		scoreObj = Problems.getScore();

		showScore();

		if (pendingCount > 0) {
			$scope.curFilter = 'Grading required';
			State.set('pendFilter', true);
		} else {
			removeFilter('Grading required');
			State.set('pendFilter', false);
		}
		if (inProgressCount === 0) {
			removeFilter('In progress');
		}
		if (studentID === undefined) {
			removeFilter('All');
		}
		PubSub.publish('updatePending', { count: pendingCount });

		// Duplicate some data so we can safely modify it
		copyFields();
	}

	// Copy the point value to a safe scratchpad area
	function copyFields() {
		for (var i = 0, len = self.problems.length; i < len; i++) {
			self.problems[i].pts = self.problems[i].score;
			self.problems[i].showPend = self.problems[i].isPending;
		}
		$scope.loading = false;
	}

	// code added by MITR

	self.sample = [{
		"text": "Sample 1"
	}, {
		"text": "Sample 2"
	}, {
		"text": "Sample 3"
	}];
	self.dd = self.sample[0];
	var _interval = setInterval(function () {
		if ($(".accordianHeading").length) {
			console.log("inside here")
			clearInterval(_interval);
			$(".accordianHeading").off("click").on("click", function () {
				var id = $(this).attr('data-target');
				if (!$(id).hasClass('open')) {
					$('#accordionWrapper .collapse').removeClass('open').slideUp();
					$(id).addClass('open').slideDown();
				} else {
					$(id).removeClass('open').slideUp();
				}
			});
		}

	}, 100);
	self.gradeBookData;
	$http.get("./app/modules/grade-change/config/settings.json").then(function (response) {
		self.gradeBookData = response.data;

	});
	self.scoreKeyDown = function (e,maxScore) {
		
		var updatedValue=e.target.value + e.key;
		if((Number(updatedValue) > Number(maxScore)) && e.keyCode != 8  && e.keyCode != 46&& e.keyCode != 17  && e.keyCode != 65){
			e.preventDefault();
		}
	}
	self.closePopup = function () {
		$('.wizard-fullscreen').css("z-index", "");
		$('.gradeChangeModalWrapper').removeClass('fade in').hide();
		$('body').css("overflow", "auto");
	}
	self.showStudentReport = function () {
		$('.wizard-fullscreen').css("z-index", "1050");
		$('.studentReportModal').show().addClass('fade in');
		$('body').css("overflow", "hidden");

	}

};
