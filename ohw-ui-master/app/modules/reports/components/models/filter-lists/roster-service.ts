'use strict';

// Model that contains
//	Students in class
export default function(PubSub) {

	var loaded = false;
	var roster = [];
	var sections = [];

	// Sets the roster for the entire class, flattening
	// and adding sections.
	function setRoster(list) {
		roster = [];
		sections = [];
		loaded = true;
		// In: id, name, students {id, first, last, email}
		_.forEach(list, function(sec) {
			sections.push({id: sec.id, name: sec.name});

			_.forEach(sec.students, function(student) {
				roster.push({
					secId: sec.id,			// Section ID
					secName: sec.name,

					id: student.id,
					text: student.last + ', ' + student.first
				});
			});
		});

		PubSub.publish('RosterModel:update');
	}

	// Returns the complete list.
	// Filtering currently needs to be handled externally.
	function get() {
//		var section = State.get('curSection');

//		if (section && section !== 'all')
//			return _.filter(roster, 'secId', section);

		var list = _.cloneDeep(roster);
		list.unshift({id: 'all', text: 'All Students'});
		return list;
	}

	function getSections() {
		return _.cloneDeep(sections);
	}

	// Public API
	return {
		// Model basics
		setRoster: setRoster,

		getSections: getSections,

		// DataProvider API for students
		get: get	// Returns the student roster for the current section
	};

};
