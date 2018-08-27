'use strict';

export default function(Assignment, Course, $q) {

	var typeMap = {
		homework: 'Homework',
		quiz: 'Quiz',
		test: 'Test',
		ipractice: 'i-Practice'
	};

	var iconList = {
		Homework: 'icon-h',
		Quiz: 'icon-q',
		Test: 'icon-t',
		'i-Practice': 'icon-p',
		default: 'icon-h'
	};

	var assignmentTypesToExclude = ['quizboard', 'quickcheck', 'virtual lab'];
	// Convert date strings to date objects

	function initDates(list) {
		for (var i = 0, len = list.length; i < len; i++) {
			if (list[i].due)
				list[i].due = new Date(list[i].due);

			if (list[i].assigned)
				list[i].assigned = new Date(list[i].assigned);
		}
	}


	// Filter out by type
	function excludeTypes(list, types) {
		types.forEach((type) => {
			list = list.filter((item) => {
				return item.type !== type;
			});
		});
		return list;
	}

// Translate assignment types

	function fixTypes(list) {
		for (var i = 0, len = list.length; i < len; i++) {
			if (typeMap[list[i].type])
				list[i].type = typeMap[list[i].type];
		}
	}


	// The data includes a product ID, which we don't care about
	// However, the existence of a non-zero product ID means that
	// the entry is a template assignment.
	// Remove the product ID and add an explicit isTemplate flag
	// to make logic further down the pipeline clearer.

	function fixTemplate(list) {
		for (var i = 0, len = list.length; i < len; i++) {
			list[i].isTemplate = !!list[i].productID;
			delete list[i].productID;
		}
	}

	function fixBookId(list) {
		_.each(list, item => { item.book_id = item.book_id !== undefined ? parseInt(item.book_id, 10) : -1; });
	}

	// Translate assignment types

	function fixStandards(list) {
		for (var i = 0, len = list.length; i < len; i++) {
			if (list[i].standards && list[i].standards.length) {
				list[i].standards = _.map(list[i].standards, 'code').sort(_std_sort);
			} else {
				list[i].standards = [];
			}
		}
	}


	// Figure out a smart sort order for assignments
	//
	// Template Assignments have a predefined sort order.
	// Custom assignments don't.
	//
	// Algorithm:
	//	Custom assigns, sorted alphabetically
	//	Template assigns, sorted by built-in sort order

	function setSetOrder(list) {
		var custom = _.filter(list, 'isTemplate', false);
		custom = _.sortBy(custom, 'name');

		var template = _.filter(list, 'isTemplate', true);
		template = _.sortBy(template, 'sortOrder');

		// Put it all back together
		list = custom.concat(template);

		for (var i = 0, len = list.length; i < len; i++)
			list[i].sortOrder = i;
	}


	// Use data from Course.getGradebook call to mark assignments that have submissions.
	function flagHasSubmissions(submission_check, list) {
		Assignment.setHasSubmissions(submission_check);
		/*
		list.forEach((item, ndx) => {
			if (submission_check[item.id]) {
				list[ndx].hasSubmissions = true;
			}
		});
		*/
	}

	// Include problem count.
	// Currently, this counts the number of items in the problems
	// array; we can change it to just reflect a property later,
	// if need be.

	function addProblemCount(list) {
		for (var i = 0, len = list.length; i < len; i++) {
			list[i].problemCount = list[i].problems.length;
		}
	}

	function get(id, sharedOnly) {
		// Create a shadow promise to allow for data cleanup
		var deferred = $q.defer();
		var ilist;

		if (sharedOnly) {
			Assignment.getImportable().then(
				function(data) {
					if (!data) return deferred.reject(data);
					var ilist = getAssignmentsFromImportableList(angular.copy(data));
					ilist = excludeTypes(ilist, assignmentTypesToExclude);
					initDates(ilist);
					fixTypes(ilist);
					fixStandards(ilist);
					fixTemplate(ilist);
					fixBookId(ilist);
					setSetOrder(ilist);
					deferred.resolve(ilist);
			});
		} else {
			Assignment.getByCourseId(id).then(function(data) {
				if (!data) return deferred.reject(data);
				var rlist = angular.copy(data);
				rlist = excludeTypes(rlist, assignmentTypesToExclude);
				initDates(rlist);
				fixTypes(rlist);
				fixStandards(rlist);
				fixTemplate(rlist);
				addProblemCount(rlist);
				fixBookId(rlist);
				setSetOrder(rlist);

				Course.getGradebook(id, { submission_check: true }).then((response) => {
					flagHasSubmissions(response.data, rlist);
					deferred.resolve(rlist);
				});
			});
		}

		return deferred.promise;
	}

	function getAssignmentsFromImportableList(courseWrappedList) {
		//the list comes from the end point with a list of courses each with a list of assignments

		var wrappedList = angular.copy(courseWrappedList);
		var returnList = [];

		wrappedList.forEach(function(item){
			item.list.forEach(function(assignItem){
				var moddedAssignItem = _.cloneDeep(assignItem);
				moddedAssignItem.is_district = item.is_district;
				moddedAssignItem.courseName = item.name;
				moddedAssignItem.course_id = item.id;
				moddedAssignItem.sharedBy = item.sharedBy;
				moddedAssignItem.book_id = item.book_id;
				returnList.push(moddedAssignItem);
			});
		});

		return returnList;
	}

	function remove(id) {
		return Assignment.del(id);
	}

	function importToCourse(id, name, courseId) {
		return Assignment.importToCourse(id, name, courseId);
	}

	// Modify the assigned and due dates for an assignment

	function setDates(id, data) {
		return Assignment.update(id, {
			assigned: data.assigned.toString(),
			due: data.due.toString(),
			students: data.students
		});
	}

	function icon(type) {
		return iconList[type] || iconList['default'];
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
		var re = {
			std: /^(\S+)[\s\.]+(\d+)(.+)?$/,
			teks: /^(\d+)(\w+)$/
		};

		var parts = re.std.exec(str);
		var teksParts = re.teks.exec(str);

		if (parts) {
			return {
				main: parts[1],
				num: parts[2],
				sub: parts[3]
			};
		} else if (teksParts) {
			return {
				main: null,
				num: teksParts[1],
				sub: teksParts[2]
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

	return {
		get: get,
		remove: remove,
		setDates: setDates,
		importToCourse: importToCourse,
		icon: icon
	};

};
