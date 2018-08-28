'use strict';

// Class Roster: List of students in a given class
//
// At present, this is a simple stand-in that doesn't do anything except provide a constant API.

export default function(Course, AppState) {

	function get(classID) {
		return Course.getRosterById(classID);
	}

	function updateRoster(courseId) {
	  Course.setById(courseId).then((res) => {
	    var tmpCourse = AppState.get('curCourse');
	    var result = _.extend(tmpCourse, res);
	    AppState.set('curCourse', result);
	  });
	}

	return {
		get: get,
		updateRoster: updateRoster
	};

};
