'use strict';

// Maintains all possible filters, and keeps track of which filters are currently active.
//
// Normalizes data sources.
// Manages filter interdependencies.
// Maintains all filter settings, but hides inappropriate filters (some filters need to be
//	removed for certain reports, while being remembered for other reports.)
export default function(CategoryModel, AssignmentModel, RosterModel, StandardModel, PubSub, State, Preferences, $rootScope) {

	var active = [];		// List of active filters
	var filterLists = {};	// Filter data. There is one of these per filter definition,
		// NOT one per data provider. That seems weird and inefficient, but the duplication is
		// just a single reference. It allows for differences to be passed to clients, namely headers.
	var curFilters = State.get('reportFilter');	// Filter settings (persisted)
	var saving = false;		// We monitor for external changes to filter settings,
		//but also change them internally. Use this to temporarily ignore change events.

	var preserveFilters = false; // Flag for prserving filters; e.g., if filter was selected, or if report accessed directly from another report.
	var filterSettings = {};

	// Definition of all filters
	var filterDefs = {
		category: {pickFirst: true, header: 'Category', field: 'category', provider: CategoryModel},

		student: {
			pickFirst: true,
			header: 'Student',		// Display text for this filter
			field: 'student',		// Filters are saved in the State. This field is used in State:curFilters.
			provider: RosterModel,	// Data source
			monitor: {event: 'RosterModel:update', action: 'rosterUpdate'},
			filter: sectionFilter
		},

		assignment: {
			pickFirst: true,
			header: 'Assignment',
			field: 'assign',
			provider: AssignmentModel,
			monitor: {event: 'AssignmentModel:update', action: 'assignsUpdate'},
			filter: rangeFilter
		},

		assignShort: {
			pickFirst: true,
			header: 'Assignment',
			field: 'assign',
			provider: AssignmentModel,
//			monitor: {event: 'AssignmentModel:update', action: 'shortAssignsUpdate'},	// The assignment monitor will take care of both
			filter: rangeFilter,
			modifier: 'noAll'		// Don't include "All Assignments", "All Homework", etc.
		},

		standard: {
			pickFirst: true,
			header: 'Standard',
			field: 'standard',
			provider: StandardModel,
			modifier: 'top',

//			filter: standardFilter,
			monitor: {event: 'StandardModel:update', action: 'standardUpdate'}
		},

		standardMulti: {
			pickFirst: true,
			header: 'Standard',
			field: 'standard',
			provider: StandardModel,

//			filter: standardFilter,
			monitor: undefined
		},

		standardLow: {
			pickFirst: true,
			header: 'Standard',
			field: 'standard',
			provider: StandardModel,
			modifier: 'noAll',

//			filter: standardFilter,
			monitor: undefined
		},

		section: {
			pickFirst: false,
			field: 'section',
			provider: function(){ return RosterModel.getSections(); },
			saveCheck: {action: 'sectionUpdate'}		// If the section is changed, we might need to update the student list
		},

		range: {
			pickFirst: false,
			field: 'range',
			provider: function(){ return cleanRanges(Preferences.get('dateRanges')); },
			monitor: {action: 'rangeUpdate', event: 'PrefChange:dateRanges'},	// Two update sources: preferences changes and filter selection
			saveCheck: {action: 'rangeUpdate'}			// If the range is changed, we might need to update the assignment list
		}
	};

	// Actions to perform on external data changes
	//
	// It's silly to list each type's own provider. This should be cleaned up.
	var actions = {
		rosterUpdate: {
			update: ['student', 'section'],				// Update these lists (by filter definition name)
			clear: ['category', 'student', 'section', 'range']		// Reset these saved settings (by filter definition name)
			                                  // Concern is, it must have been there for a reason.
		},

		assignsUpdate: {
			update: ['assignment', 'assignShort'],		// Update both lists
			clear: [clearAssignment]					// But only use one list for selecting an option
		},

		standardUpdate: {
			update: ['standard', 'standardMulti', 'standardLow'],		// Update all lists
			clear: [clearStandard]					// But only use one list for selecting an option
		},

		rangeUpdate: {
			update: ['range'],
			clear: [verifyAssign]		// Ensure the currently selected assignment is still valid
		},

		sectionUpdate: {
			update: ['section'],
			clear: [verifyStudents]	// Ensure the currently selected student is still valid
		}
	};

	// Init internal data
	initData();

	PubSub.subscribe('StateChange:reportFilter', filterChange);

// Init

	// Prep data for both filters in a consistent format
	function initData() {
		_.forEach(filterDefs, function(def, name) {
			var field = def.field;

			var data = fetchData(name);

			filterLists[name] = {
				header: def.header,
				list: data,
				filter: def.filter,
				field: def.field,
				isEmpty: function(){return listEmpty(name); }
			};

			// Add event monitors to handle externally changed data
			installMonitor(def);
		});
	}

	function fetchData(defType) {
		var def = filterDefs[defType];
		var provider = def.provider;
		var mod = def.modifier;

		var data = (typeof provider === 'function' ? provider(mod) : provider.get(mod));
		return data;
	}

	// Add event monitors to handle externally changed data
	function installMonitor(filter) {
		if (filter.monitor && filter.monitor.event) {
			PubSub.subscribe(filter.monitor.event, function() {
				dataChanged(filter.monitor.action);
			});
		}
	}

// Event handlers

	// Change event handler
	function dataChanged(actionName, forcePublish) {
		var action = actions[actionName];

		// Update the data source first. Clear depends on new data.
		if (action.update) updateData(action.update);

		// Clear requested settings.
		if (!preserveFilters) {
			if (action.clear) clearSettings(action.clear);
		}

		// Save the changes
		var dontPublish = !forcePublish;	// Normally, don't tell the world. The world kicked off the event that got us here.
		saveFilter(dontPublish);			// Sometimes we get here without the world knowing. In that case, go ahead and publish.
	}

	// Update requested data stores
	function updateData(list) {
		for (var i = 0, len = list.length; i < len; i++) {
			var name = list[i];
			filterLists[name].list = fetchData(name);
			if (name === 'student') {
			}
		}
	}

	// Clear requested settings
	function clearSettings(list) {
		for (var i = 0, len = list.length; i < len; i++) {
			if (typeof list[i] === 'string') {
				var name = list[i];
				var def = filterDefs[name];

				// For items with pickFirst set, clearing means select the first item (update must occur before clear)
				if (def.pickFirst && filterLists[name].list.length) {
					pickFirst(name);
				} else {
					delete curFilters[def.field];	// Items without pickFirst just get deleted
				}
			} else {
				list[i]();
			}
		}
	}

	// Provide each Reports module with the ability to reset dropdown filters.
	function resetFilters() {
		if (preserveFilters) return;

		_.each(actions, function(action) {
			if (action.clear) {
				clearSettings(action.clear);
			}
		});
	}

	// Navigation detection: preserveFilters === true if navigated to report by means other than module menu.
	// This information is necessary for determining whether or not to reset filters for a report.
	function setPreserveFilters(setting) {
		preserveFilters = !!setting;
	}

	// Choose the first option in the list, not counting items
	// that are filtered out.
	function pickFirst(name) {
		var def = filterDefs[name];

		for (var i = 0, len = filterLists[name].list.length; i < len; i++) {
			var candidate = filterLists[name].list[i];
			if (def.filter && def.filter(candidate)) {
				curFilters[def.field] = candidate.id;
				return;
			}
		}

		// Nothing works. Pick the first item in the list, regardless of filter.
		if (filterLists[name].list.length > 0) {
			curFilters[def.field] = filterLists[name].list[0].id;
		} else {
			curFilters[def.field] = 'NONE!';		// No match. Create a filter that's impossible to satisfy. Otherwise we erroneously get unfiltered data.
		}
	}

	// Set the assignment filter based on whether
	// assignment or assignShort is active.
	function clearAssignment() {
		var name = pickAssignList();
		pickFirst(name);
	}

	function clearStandard() {
		var name = pickStandardList();
		pickFirst(name);
	}

	// Ensure that the current select is valid.
	// If not, pick the first valid entry.
	function verifySetting(name) {
		var field = filterDefs[name].field;
		var filter = filterDefs[name].filter;
		var cur = _.find(filterLists[name].list, {id: curFilters[field]});

		if (!cur || (filter && !filter(cur)))
			pickFirst(name);
	}

	// If we're displaying students, and the currently selected
	// student doesn't match the filter, reset to ALL.
	function verifyStudents() {
		verifySetting('student');
		saveFilter();
	}

	// Clear the currently selected assignment if it doesn't
	// match the current filters (date range).
	function verifyAssign() {
		verifySetting(pickAssignList());
		saveFilter();
	}

	function pickAssignList() {
		if (active.indexOf('assignShort') !== -1)
			return 'assignShort';

		return 'assignment';
	}

	function pickStandardList() {
		if (active.indexOf('standardMulti') !== -1) {
			return 'standardMulti';
		} else if (active.indexOf('standardLow') !== -1) {
			return 'standardLow';
		}
		return 'standard';
	}

	function filterChange(data) {
		// This technically isn't necessary, but should speed things up slightly.
		// The incoming data is identical to curFilters (since we just caused the change)
		// but it's not equal (the same reference). If we set curFilters, it could set off
		// another digest cycle.
		if (saving)
			return;

		curFilters = data;
	}

// External data filters

	// Determine whether a list is empty or not, taking filters
	// into account. Filters are applied on the fly, so this
	// is the only way for the UI to know ahead of time whether
	// there is a list to display.
	function listEmpty(name) {
		// Get filter and list
		var filter = filterDefs[name].filter;
		var list = filterLists[name].list;

		if (!list.length)
			return true;

		if (filter) {
			// Step through list, applying the filter to each entry.
			// If any entry is found, exit.
			for (var i = 0, len = list.length; i < len; i++) {
				if (filter(list[i]))	// If an entry is found
					return false;		// the list isn't empty.
			}

			// The list must be empty; no entries were found
			return true;
		}

		// There's no filter, and the list isn't empty.
		return false;
	}

	// Filter the student list by section
	function sectionFilter(value, index, array) {
		if (!value.id || value.id === 'all')
			return true;

		return !(curFilters.section && value.secId !== curFilters.section);
	}

	// Filter the assignment list by date range
	function rangeFilter(value, index, array) {
		if (!value.id || value.id === 'all')
			return true;

		var range = curFilters.range && getRange(curFilters.range);

		return !(range &&
				(value.due < range.start || value.due > range.end)
		);
	}

	// curFilters holds a range ID, and we need access to the
	// actual date range. Perform a looked using the ID.
	function getRange(id) {
		return _.find(filterLists.range.list, {id: id});
	}

	function standardFilter(value, index, array) {
		return true;
	}

// Data helpers

	// Convert date strings to objects
	// We're editing and place and returning the original object.
	// That should be safe as long as Preferences gives us a cloned object.
	function cleanRanges(data) {
		var i, len = data && data.length || 0;
		for (i = 0; i < len; i++) {
			data[i].start = new Date(data[i].start);
			data[i].end = new Date(data[i].end);
		}

		return data;
	}

	// Save the filters, which presumably have just changed.
	function saveFilter(dontPublish) {
//		State.set('reportFilter', curFilters, dontPublish);	// Saves setting (for this session only) and updates the display

		saving = true;
		State.set('reportFilter', curFilters);		// Saves setting (for this session only) and updates the display
		saving = false;
	}

	// Special checking for data changed by the filter bar UI
	// rather than captured by a monitored event.
	// These could instead generate events, but this is a little
	// cleaner (externally) at a small cost to complexity inside here.
	function checkChanges(newData) {
		var out = [];

		// Not terribly efficient, but we're sharing curFilters so we don't have any other source of old data.
		var oldData = State.get('reportFilter');

		// Find list of fields to monitor for changes
		_.forEach(filterDefs, function(def, defName) {
			if (def.saveCheck) {
				// This field needs to be monitored. Now check for changes.
				if (!_.isEqual(oldData[defName], newData[defName]))
					out.push(def.saveCheck.action);		// CHANGED! Save the action handler for later.
			}
		});

		return out;
	}

// API

	// Sets the currently active filters.
	// Returns the relevant list of options.
	function registerFilters(list) {
		active = list;

		var out = [];
		for (var i = 0, len = active.length; i < len; i++)
			out.push(filterLists[active[i]]);

		return out;
	}

	// Get current settings
	function getCurrent() {
		// Ensure the current settings are still valid. If not, fix them.
		// Combine these into verifySetting() for each active filter!
		for (var i = 0, len = active.length; i < len; i++)
			verifySetting(active[i]);

		// Save once, following all verifySetting calls
		saveFilter(true);

		// Filters are stable. Let the world know it can rely on the settings not changing anymore.
//		PubSub.publish('filterChanged');
		$rootScope.$broadcast('filterChanged');

		return curFilters;		// We're sharing this, so don't clone it. It's not the best form, but it means we don't have to send events back and forth.
	}

	function getList(field) {
		return filterLists[field].list;
	}

	// Save filter settings so they're accessible to controllers.
	// Added to allow detection of selected student in filter dropdown.
	// Needed for filtering out assignments whose subset of students does not include selected student.
	function saveFilterSettings(data) {
		filterSettings = {};
		_.each(data, (val, key) => {
			filterSettings[key] = val;
		});
	}

	// Return filter settings. This reason for exposing the filters was to make the selected student available to the controller.
	function getFilterSettings() {
		return filterSettings;
	}

	// The user changed a filter via the UI (this is triggered by filter-bar)
	//
	// ??? Merge in settings. Clients only have a subset of filters.
	function setFilters(data, doNotify) {
		// Store filter settings so they can be available to a controller.
		saveFilterSettings(data);
		// Checking for notification of changes on saves is a two-pass process.
		// First, figure out if there are any changes.
		var changeActions = (doNotify ? checkChanges(data) : []);

		// Update our internal list of active filters
//		curFilters = data;		// Doesn't do anything! We're already directly sharing this variable

		// Save the list of active filters
		// If there are change actions, there will be a save later. Don't save now as it will cause issues
		if (!changeActions.length)
			saveFilter();

		// Second pass for change detection notification.
		// Perform the actual notifications that were requested.
		for (var i = 0, len = changeActions.length; i < len; i++)
			dataChanged(changeActions[i], true);		// Changes were will be published to the world

//		PubSub.publish('filterChanged');
		$rootScope.$broadcast('filterChanged');
	}

	// Public API
	return {
		registerFilters: registerFilters,
		getList: getList,
		getCurrent: getCurrent,
		resetFilters: resetFilters,
		setPreserveFilters: setPreserveFilters,
		setFilters: setFilters,
		getFilterSettings: getFilterSettings
	};

};
