'use strict';

export default function(FilterManager, TruncateName, PubSub, State, $uibModal, $scope) {

	var self = this;

	var maxLen = 16;	// Maximum length for extra filters before switching to truncated names

	// This is ugly! The model is located on the parent (directive) $scope instead of the local scope.
	// We could use resolve() on the directive, or copy all of the items over manually.
	// For now, we're using the laissez-faire method, which isn't ideal.
	var filters = [];
	if ($scope.type1)
		filters.push($scope.type1);

	if ($scope.type2)
		filters.push($scope.type2);

	self.filters = FilterManager.registerFilters(filters);
	self.curFilters = FilterManager.getCurrent();

	var ranges = FilterManager.getList('range');
	var sections = FilterManager.getList('section');

	initData();

	// Prep data for both filters in a consistent format
	function initData() {
		if (self.filters[0])
			self.list1 = self.filters[0];

		if (self.filters[1])
			self.list2 = self.filters[1];
	}

	// Save the filters, which presumably have just changed.
	self.saveFilter = function(doNotify)
	{
		var filtersObj = { filters: State.get('reportFilter') };
		PubSub.publish('reportChange', filtersObj);
		FilterManager.setFilters(self.curFilters, doNotify);
	};

	self.filterBlank = function(obj) {
			if (!obj || !_.has(obj, 'text') || obj.text.length < 1) {
				obj.text = 'No Assignment Name';
			}
			return obj;
	};

	// Open the Set Filters modal
	self.filterMenu = function()
	{
		// Ensure we have the latest list (they might have been loading on instantiation)
		ranges = FilterManager.getList('range');
		sections = FilterManager.getList('section');

		// Create the modal
		var template = require('../shared-modals/filter-modal.html');
		var modal = $uibModal.open({
			templateUrl: template,
			controller: 'FilterModalCtrl as ctrl',
			resolve: {
				curFilter: function() { return self.curFilters; },

				sectionList: function() { return sections; },
				dateRanges: function() { return ranges; }
			}
		});

		// Save the results
		modal.result.then(modalClosed);
	};

	// Extra filters set by modal
	function modalClosed(result) {
		if (result.section !== 'all') {
			self.curFilters.section = result.section;
		} else {
			delete self.curFilters.section;
		}
		if (result.range !== 'all') {
			self.curFilters.range = result.range;
		} else {
			delete self.curFilters.range;
		}
		// Save the changes
		self.saveFilter(true);

		// Update our range list because it could have been changed
		ranges = FilterManager.getList('range');
	}

	// Look up and format section name
	self.sectionText = function()
	{
		var text = _.find(sections, {id: self.curFilters.section}).name;
		return TruncateName(text, maxLen);
	};

	// Look up and format range name
	self.rangeText = function()
	{
		var text = _.find(ranges, {id: self.curFilters.range}).name;
		return TruncateName(text, maxLen);
	};

	// Returns filter button text based on which filters are active.
	self.filterTitle = function()
	{
		if (!self.curFilters.range && !self.curFilters.section)
			return 'None';

		if (self.curFilters.range && self.curFilters.section)
			return 'Two active';

		if (self.curFilters.range)
			return self.rangeText();

		return self.sectionText();
	};

	// Clear a filter (the little red X was pressed)
	self.removeFilter = function($event, type)
	{
		// I have no idea why these are necessary. Without them, a route event occurs!
		$event.preventDefault();
		$event.stopPropagation();

		// Clear the filter
		delete self.curFilters[type];

		// Save the changes
		self.saveFilter(true);
	};

};
