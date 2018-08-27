'use strict';

export default function(CategoryModel, PubSub, $filter, TruncateName) {

	var lists = {};
	var natSortFilter = $filter('NatSort');

	setAssignments([], true);

	// Create several versions of the assignments list
	function setAssignments(list, dontPublish) {
		lists.assigns = [];

		// Presort by due date
//		list = _.sortBy(list, 'due');
		// Alphanumeric presort
		list = natSortFilter(list, 'name');
		// Simple list -- copy from definition
		// Do we need due date?
		_.forEach(list, function(asn) {
			lists.assigns.push({
				id: asn.id,
				text: TruncateName(asn.name, 32),
				type: asn.type,
				due: asn.due,
				isSubAssign: asn.isSubAssign,
				subSetAssigned: asn.subSetAssigned
			});
		});

		// List with ALL
//		lists.assignsAll = _.clone(lists.assigns);
//		lists.assignsAll.unshift('All Assignments');

		// List with categories and ALL
		lists.assignsCats = _.clone(lists.assigns);
		_.forEachRight(CategoryModel.get(), function(cat) {
			if (cat.id !== 'all')
				lists.assignsCats.unshift({
					id: 'all_' + cat.id,
					text: 'All ' + (cat.plural || cat.text)
				});
		});
		lists.assignsCats.unshift({id: 'all', text: 'All Assignments'});

		if (!dontPublish)
			PubSub.publish('AssignmentModel:update');
	}

	function get(modifier) {
		if (modifier === 'noAll')
			return lists.assigns;

		return lists.assignsCats;
	}

	// Public API
	return {
		// Model basics
		setAssignments: setAssignments,

		// DataProvider API
		get: get
	};

};
