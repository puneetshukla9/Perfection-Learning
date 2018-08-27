'use strict';

export default function(User, $scope, $location, PubSub, Admin, Teacher, Course, Student, State, AdminData) {

	var self = this;
	var filters;
	var filterSource;
  var activeTableDefs = AdminData.getActiveTable();

  self.showSearchFilter = true;

  AdminData.setFilter(this);

	self.init = function() {
		// no guarantee data here is fresh .. need to pull based on filter source
		filters = State.get('viewFilter');
		self.searchFilter = State.get('searchFilterText');

		filterSource = State.get(activeTableDefs.filterSource);

		if (activeTableDefs.filter)
			self.filter = activeTableDefs.filter;

		if (self.filter) {
			self.filter.list = filterSource;
			if (filters && filters[activeTableDefs.filter.active]) {
				var found = false;
				for (var key in self.filter.list) {
					if (self.filter.list[key].name === filters[activeTableDefs.filter.active].name)
						found = true;
		    }
				if (found) {
					self.filter.selected = filters[activeTableDefs.filter.active];
				} else if (filterSource) {
					self.filter.selected = filterSource[0];
					filters[activeTableDefs.filter.active] = filterSource[0];
				}
			} else if (activeTableDefs.filter && filterSource) {
				self.filter.selected = filterSource[0];
				filters[activeTableDefs.filter.active] = filterSource[0];
			}

			filters.applyFilterToTable = activeTableDefs.applyFilterToTable;
			State.set('viewFilter', filters);
			PubSub.publish('FilterChanged');
		}
	};

	self.init();
	AdminData.loadInfoData();

	// loads new data appropriate to filter selection and triggers grid refresh
	self.filterLoad = function(activeTableDefs, filter) {
		var source = activeTableDefs.filterSource;
		var entityType = activeTableDefs.gridSource; // 'schoolsTeachers' what do we want?
		var maps = {
			administrators: {
				schools: Admin.getBySchool
			},
			schoolTeachers: {
				classes: Course.all,						 // all classes
				students: Student.getAllCourses, // get student sked
				schools: Teacher.getBySchoolRoster, 	 // get list of teachers for school // how to distinguish?
				teachers: Course.allByUserId 		 // get teacher sked
			},
			schoolStudents: {
				classes: Course.all,
				students: Student.getAllCourses,
				schools: Student.getBySchoolRoster 	 // get list of students for school -- save into schoolStudents
			},
			schoolClasses: {
				schools: Course.all // Course.getBySchoolRoster
			},
			teachers: {
				schools: Teacher.getBySchool
			},
			teachersSchedule: {
				teachers: Course.allByUserId
			},
			students: {
				schools: Student.getBySchool // must save to students
			},
			studentsClasses: {
				students: Course.allByStudentId
			},
			classes: {
				// schools: Course.getBySchool
				schools: Course.all
			},
			classesStudents: {
				classes: Course.getStudentListById
			},
			classesTeachers: {
				classes: Course.getTeacherListById
			}
		};
		if (entityType) {
			var map = maps[entityType];
			var fn = map[source];
			if (fn) {
				return fn(filter.selected).then(function(res) {
					PubSub.publish('tableDataChanged'); // trigger data refresh
				});
			}
		} else {
			// load up an individual record (source: 'teachers', 'students', etc.)
			var
				filterObj = {},
				id = filter.selected,
				entity = filter.list;
			filterObj[filter.uniqueID] = id;
			var result = _.find(entity, filterObj);
			switch (source) {
				case 'students':
					break;
				case 'teachers':
					break;
				default:
					break;
			}
		}
	};

	// handles select
	self.select = function(item) {

		var filters = State.get('viewFilter');
		filters[activeTableDefs.filter.active] = self.filter.selected;


		self.filterLoad(activeTableDefs, self.filter);

		State.set('viewFilter', filters);
		State.set('dropDownSelectedItem', self.filter.selected);

		AdminData.loadInfoData();
		// $scope.ctrl.refresh();

		PubSub.publish('FilterChanged');
	};

	self.searchFilterChanged = function() {
		State.set('searchFilterText', self.searchFilter);
		$scope.ctrl.refresh();
	};

	self.clearFilter = function() {
		self.searchFilter = '';
		self.searchFilterChanged();
	};

	// format typeahead selection
	self.formatLabel = function(collection, uniqueId, displayName, model) {
		var searchObj = {};
		searchObj[uniqueId] = model;
	    var result = _.find(collection, searchObj);
	    if (result) {
	      return result[displayName];
	    } else {
	      return '';
	    }
	};

};
