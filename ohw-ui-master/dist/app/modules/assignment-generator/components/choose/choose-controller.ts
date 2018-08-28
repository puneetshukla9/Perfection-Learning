'use strict';

import * as $ from 'jquery';

export default function($rootScope, $timeout, $state, Assignment, AppState, AssignmentHelper, ProblemHelper, Hotkey,
	Wizard, State, Preferences, PubSub, $scope) {

	var self = this;

	AssignmentHelper.isReadOnly(AppState.get('user_id'));

	if ($state.params.id) {
		AssignmentHelper.load($state.params.id).then(() => { init(); });
	} else {
		var newId = AssignmentHelper.getId();
		if (newId) {
			$timeout(() => { $state.go($state.current.name, {id: newId}); });
		} else {
			$timeout(() => { $state.go('assignGenApp.details'); });
		}
	}

	self.problems = [];		// List of IDs for currently displayed problems

	// This will be bootstrapped in
	self.tabs = AppState.get('stdList');
	var showStds = AppState.get('showStds');
	// Get the current options, and watch for changes
	self.options = {
		showStandards: Preferences.get('showStandards'),
		showImages: Preferences.get('showImages'),
		showIcons: AppState.get('curCourse').product !== 'amsco'
	};

	Hotkey.set('showIDs', $scope);
	self.doShowIDs = Hotkey.get('showIDs');

	var setLocalPrefs = function(e, data) {
		self.options.showStandards = data.showStandards;
		self.options.showImages = data.showImages;
	};

	$rootScope.assignGen = $rootScope.assignGen || {};

	self.checkValid = function() {
		var count = AssignmentHelper.getCount();
		if (count) {
			$rootScope.assignGen.chooseValid = true;
			$rootScope.assignGen.printValid = true;
		} else {
			$rootScope.assignGen.chooseValid = false;
			$rootScope.assignGen.printValid = false;
		}
		return count;
	};

	self.checkValid();

	$scope.$on('preferences changed', setLocalPrefs);

	// Use JavaScript rather than CSS to set height of scrollable area for chapter/standard selection and problem list.
	function setScrollableHeight() {
		var wh = $(window).height();
		var offset = $('#select-chapters-standards').offset();
		var scrollable = wh - offset.top;
		$('#select-chapters-standards').css({height: scrollable + 'px'});
		$('#problem-list').css({height: scrollable + 'px'});
	}

	function init() {
		// Set the scroll height; also, set again if window is resized.
		setScrollableHeight();
		$(window).resize(setScrollableHeight);

		var assignData = AssignmentHelper.getData();
		self.problems = [];
		initState();
		loadHierarchy();
		loadProblemList();
	}

	function initState() {
		self.state = {
			probSetName: 'Problems',	// Placeholder for header text. It's replaced as soon as the user chooses a standard to load
			curTab: 0,
			curHierarchy: -1,
			curProbSetId: -1
		};
		State.set('choose', self.state);
	}

	function updateState() {
		State.set('choose', self.state);
	}

	function loadHierarchy() {
		var curStd = self.tabs[self.state.curTab].id;
		return Assignment.getHierarchy(curStd).then((data) => {
			self.hierarchy = data;
			if (self.state.curHierarchy !== -1)
				self.hierarchy[self.state.curHierarchy].isOpen = true;
		});
	}


	// Section/standard clicked on
	self.showProblems = function(id, name) {
		if (self.state.curProbSetId === id) return;
		self.state.curProbSetId = id;		// Not technically loaded yet, but we won't have the ID later
		var prefix = self.tabs[self.state.curTab].prefix;
		self.state.probSetName = prefix + ' ' + name;
		updateState();
		loadProblemList();
	};


	// Does the actual problem list load
	function loadProblemList() {
		self.problems = [];
		self.loadingProblems = true;
		Assignment.getProblems(self.state.curProbSetId).then(probsLoaded);
	}

	function probsLoaded(data) {
		self.loadingProblems = false;
		var list = ProblemHelper.addMany(data);		// Add the data to the problem bank
		// Scroll the list to the top. Doing this at just the right time is vital to avoid flicker. This appears to be the right spot.
		PubSub.publish('reset_problem_list');
		self.problems = ProblemHelper.getMany(list);	// Add a local cache of all active problems
	}


	// Added to allow insertion of problem number into question prefix.

	self.prefixWithProbNo = function(p, idx) {
		return '<b>' + idx + '.&nbsp;</b>' + p;
	};



	// Added to allow insertion of problem number into question.

	self.questionWithProbNo = function(p, q, idx) {
		if (!p) {
			return '<b>' + idx + '.&nbsp;</b>' + q;
		} else {
			return q;
		}
	};

	self.getStdClass = function(id) {
		return (id === self.state.curProbSetId) ? 'stdActive' : '';
	};

	self.inAssignment = function(id) {
		return (AssignmentHelper.exists(id) ? 'inAssignment' : '');
	};

	self.toggleProblem = function(id) {
		AssignmentHelper.toggleProblem(id);
	};

	self.getTabClass = function(tabIdx) {
		if (!self.state) return;
		if (self.state.curTab === tabIdx) {
			return 'btn-default active';
		} else {
			return 'btn-primary';
		}
	};

	self.setTab = function(tabIdx) {
		self.state.curTab = tabIdx;
		self.state.curHierarchy = -1;
		loadHierarchy().then(() => {
			updateState();
		});
	};

	self.isNoProblems = function() {
		if (!self.state) return;
		return (self.state.curProbSetId !== -1 && !self.problems.length && !self.loadingProblems);
	};

	self.setHierarchy = function(idx) {
		self.state.curHierarchy = idx;
		updateState();
	};


	// Determine whether the specified hierarchy group is
	// the currently active (selected) entry.

	self.isActiveGroup = function(idx) {
		return self.state.curHierarchy === idx;
	};


	// Determines whether a standard should be displayed or not

	self.showStd = function(id) {
		return (showStds.indexOf(id) !== -1) && self.options.showStandards;
	};

	self.doShowImage = function(prob) {
		return (!!prob.qImg) && self.options.showImages;
	};

	self.doShowIcons = function() {
		return self.options.showIcons;
	};

	self.isDragDrop = function(prob) {
	//		var result = prob.presentation_data && prob.presentation_data.type === 'drag_drop_1' || prob.presentation_data.type === 'drag_drop_2';
		var result = prob.presentation_data && prob.presentation_data.type;
		return result;
	};

	self.hasChoices = function(prob) {
		var result = prob.choices && prob.choices.length > 0 && !self.isDragDrop(prob);
		return result;
	};

	self.formatChoices = function(list) {
		var out = [];
		for (var i = 0, len = list.length; i < len; i++)
			out.push( '&#x25CF;&nbsp;' + list[i].a );
		return out.join('&#x2002; ');
	};

};
