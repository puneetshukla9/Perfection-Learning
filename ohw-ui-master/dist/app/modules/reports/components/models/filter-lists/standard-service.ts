'use strict';

// Model that contains
//	Students in class
export default function(PubSub, $filter) {

	var lists = {};		// Output data

	var textMap = {};
	var stdMap = {};
	var hierarchy = {};
	var natSortFilter = $filter('NatSort');

	setStandards([]);

	// Sets the roster for the entire class, flattening
	// and adding sections.
	function setStandards(data) {
		// Construct the multi-level list and the topOnly list at the same time
		// multi-level interleaves top-level standards and low-level standards
		lists.multiLevel = [];
		lists.topOnly = [];
		lists.lowOnly = [];
		stdMap = {};
		textMap = {};
		hierarchy = {};
		data = natSortFilter(data, 'code');
		_.forEach(data, function(topLevel, parentIdx) {

			if (!hierarchy[parentIdx])
				hierarchy[parentIdx] = topLevel;

			var shortName = topLevel.short_name || 'SHORT NAME HERE';

			// Record used in all lists. Prefix the ID so it can be detected as a top-level ID.
			var record = {
				id: 'p_' + parentIdx,		// id & text are the basic dataProvider API. They are mandatory!
				text: topLevel.code + ': ' + shortName	// Consider using code + trunc(desc)
			};
			lists.multiLevel.push(record);
			lists.topOnly.push(record);

			// Add in low-level standards to the multiLevel list
			for (var i = 0, len = topLevel.children.length; i < len; i++) {
				var std = topLevel.children[i];
				std.parent = parentIdx;

				stdMap[std.id] = std;

				record = {
					id: std.id,		// id & text are the basic dataProvider API. They are mandatory!
					text: std.code	// Consider using code + trunc(desc) -- however, desc has HTML tags in it
				};

				lists.multiLevel.push(record);
				lists.lowOnly.push(record);

				// While we're here, build a map to translate standard IDs to text
				textMap[record.id] = record.text;
			}
		});

		// Add in the ALL entries to the appropriate lists
		lists.multiLevel.unshift({id: 'all', text: 'ALL Standards'});
		lists.topOnly.unshift({id: 'all', text: 'ALL Standards'});
	}

	// Group by parent ID.
	// _.groupBy doesn't work since we need to maintain the key.
	function groupStandards(list) {
		var out = {};

		_.forEach(list, function(std, id) {
			if (std.parent) {
				if (!out[std.parent])
					out[std.parent] = [];

				out[std.parent].push(id);
			}
		});

		return out;
	}

	// Returns the complete list.
	// Filtering currently needs to be handled externally.
	function get(modifier) {
		if (modifier === 'top') {
			return lists.topOnly;
		} else if (modifier === 'noAll') {
			return lists.lowOnly;
		}
		return lists.multiLevel;
	}

	// Returns the raw standards list.
	// Everything in "lists" is a displayable list of filters.
	function getMap() {
		return stdMap;
	}

	// Returns info for a high-level standard given an ID.
	// Returns null if the high-level standard can't be found.
	function getTopLevel(id) {
		return hierarchy[id];
	}

	// Returns the parent ID for a given standard ID
	function getParent(id) {
		return stdMap[id] && stdMap[id].parent;
	}

	function getText(id) {
		return textMap[id];
	}

	function limitStandards(filter) {
		// Figure out which parents are represented by the supplied low-level standards
		_.forEach(filter, function(junk, id) {
			var parentID = stdMap[id].parent;
			filter['p_' + parentID] = true;
		});

		// Add in the "all" item. Don't remove that!
		filter.all = true;

		// Iterate through all of the lists, removing unrepresented items
		_.forEach(lists, function(list) {
			pruneList(list, filter);
		});

		PubSub.publish('StandardModel:update');
	}

	// Iterate through all of the lists, removing unrepresented items
	function pruneList(list, filters) {
		for (var i = list.length - 1 ; i >= 0; i--) {
			if (!filters[list[i].id]) list.splice(i, 1);
		}
	}

	// Public API
	return {
		// Model basics
		setStandards: setStandards,
		limitStandards: limitStandards,

		getMap: getMap,
		getTopLevel: getTopLevel,
		getParent: getParent,

		getText: getText,

		// DataProvider API
		get: get
	};

};
