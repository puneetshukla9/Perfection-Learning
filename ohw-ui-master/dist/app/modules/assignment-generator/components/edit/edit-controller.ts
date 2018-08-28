'use strict';

export default function($rootScope, $timeout, $state, AppState, Hotkey,
	Wizard, AssignmentHelper, ProblemHelper, State, Preferences, $scope, $anchorScroll, $window) {

	var self = this;
	AssignmentHelper.isReadOnly(AppState.get('user_id'));

	var showStds = AppState.get('showStds');

	self.loading = true;
	self.status = '';

	var setLocalPrefs = function(e, data) {
		self.options.showStandards = data.showStandards;
		self.options.showImages = data.showImages;
	};

	$rootScope.assignGen = $rootScope.assignGen || {};

	if ($state.params.id) {
		AssignmentHelper.load($state.params.id).then(() => { init(); });
	} else {
		$timeout(() => { $state.go('assignGenApp.details'); });
	}

	$scope.$on('preferences changed', setLocalPrefs);

	function init() {
		$anchorScroll();
		var assignData = AssignmentHelper.getData();
		self.assign = AssignmentHelper.getCollapsed();	// ID, Quantity, Points -- No other problem data
		self.assignName = assignData.name;
		self.loading = false;
		self.readonly = AssignmentHelper.isReadOnly(AppState.get('user_id'));
		self.hasSubmissions = assignData.hasSubmissions;
		delete $rootScope.assignGen.customWizardTabs;
	}

	self.checkValid = function() {
		var count = AssignmentHelper.getCount();
		if (count) {
			$rootScope.assignGen.printValid = true;
		} else {
			$rootScope.assignGen.printValid = false;
		}
		return count;
	};

	self.checkValid();

	// Get the current options, and watch for changes
	self.options = {
		showStandards: Preferences.get('showStandards'),
		showImages: Preferences.get('showImages'),
		showIcons: !AppState.get('amsco')
	};

	Hotkey.set('showIDs', $scope);
	self.doShowIDs = Hotkey.get('showIDs');

	// Determines whether it's legal to adjust the quantity

	self.canSetQty = function(prob)
	{
		// It the problem isn't VTPed, NO
		if (!prob.isVTP)
			return false;

		// For certain answer types, NO
		if (!ProblemHelper.canSetQty(prob.ansType))
			return false;

		return true;
	};


	// Remove a problem from the assignment

	self.remove = function(prob) {
		var id = prob.probID;
		AssignmentHelper.removeProblem(id);

		var idx = self.assign.indexOf(prob);
		self.assign.splice(idx, 1);
	};

	self.setPoints = function(prob, isValid) {
		if (isValid)
			AssignmentHelper.setPoints(prob.probID, prob.points);
	};

	self.setQuantity = function(prob, isValid) {
		if (isValid)
			AssignmentHelper.setQuantity(prob.probID, prob.qty, prob.points);
	};

	// Determines whether a standard should be displayed or not

	self.showStd = function(id)	{
		return (showStds.indexOf(id) !== -1) && self.options.showStandards;
	};

	self.doShowImage = function(prob)	{
		return (!!prob.qImg) && self.options.showImages;
	};

	self.doShowIcons = function()	{
		return self.options.showIcons;
	};

  self.isDragDrop = function(prob) {
//		var result = prob.presentation_data && prob.presentation_data.type === 'drag_drop_1' || prob.presentation_data.type === 'drag_drop_2';
		var result = prob.presentation_data && prob.presentation_data.type;
		return result;
	};

	self.hasChoices = function(prob)	{
		var result = prob.choices && prob.choices.length > 0 && !self.isDragDrop(prob);
		return result;
	};

	self.formatChoices = function(list)	{
		var out = [];

		for (var i = 0, len = list.length; i < len; i++)
			out.push( '&#x25CF;&nbsp;' + list[i].a );
			//out.push( ' &nbsp;' + list[i].a );

		return out.join('&#x2002; ');
	};

};
