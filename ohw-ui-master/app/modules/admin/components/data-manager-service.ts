'use strict';

export default function($rootScope, AppState, Config, State, PubSub, ViewDefinitions, License, LicenseHelper, Bookshelf, School, Course, User, $q) {

	var self = this,
		adminData = {},
	  activeTable,
	  students,
	  classes,
	  schools,
	  teachers,
	  licenses,
	  administrators,
	  classesStudents,
	  schoolStudents,
	  schoolTeachers,
	  classesTeachers,
	  schoolClasses,
	  studentsClasses,
	  teachersSchedule,
		filterObj,
		hasInitialized;

	var isPLCAdmin = AppState.get('isPLCAdmin');

	function init() {
		// load students, classes, schools, then load the 'info data"
		// Now that students, classes and students have been loaded (in random order, so we had to wait for everything to finish)
		//PubSub.publish('status', {act: 'loading'});
		var start = new Date();
		var startTime = start.getTime();
		var distSchoolPromise;

		var promiseArr = [
			User.get(),
			Course.all(AppState)
			//Bookshelf.school(AppState.get('school_id')),
			//Bookshelf.userBookshelf(AppState.get('user_id'), AppState.get('ebooksAuthToken'))
		];

		if (isPLCAdmin) {
			promiseArr.push(License.getForPLC());
		} else {
			promiseArr.push(License.getAllLicenses({ products: Config.PRODUCTS_FOR_LICENSE }));
		}

		return $q.all(promiseArr).then(() => {
			var secondPromiseArr = [];
			secondPromiseArr.push(School.all(AppState));

			$q.all(secondPromiseArr).then((res) => {

					if (filterObj) filterObj.init();
					loadInfoData();
					LicenseHelper.correctSeatsUsed();
					LicenseHelper.compileLicenseData();
					var finish = new Date();
					var finishTime = finish.getTime();
				//4.7 sec for new users
					self.hasInitialized = true;
					$rootScope.$broadcast('initial fetch complete');
			});
		});

	}

	function hasInitialized() {
		return self.hasInitialized;
	}

	function setFilter(obj) {
		filterObj = obj;
	}

	function loadInfoData() {

		schools = State.get('schools');
		classes = State.get('classes');
		students = State.get('students');
		teachers = State.get('teachers');
		administrators = State.get('administrators');
		licenses = State.get('licenses');

		var filters = State.get('viewFilter');
		var selectedItem, index;

		if (activeTable && activeTable.filter && activeTable.filter.active && filters[activeTable.filter.active]) {
			selectedItem = filters[activeTable.filter.active]; //make sure it exists
		}

		// selectedItem has id not course_id
		if (selectedItem) {

			schoolTeachers = []; // teachers for this school
			classesTeachers = []; // teachers for this class

			for (index in teachers) {
				// Schools Teacher Info
				if (selectedItem.school_id === teachers[index].school_id || selectedItem.type === 'District' ) {
    			schoolTeachers.push(teachers[index]);
    		}
    		if (selectedItem.course_id === teachers[index].course_id || selectedItem.type === 'District') {
    			classesTeachers.push(teachers[index]);
    		}
			}

			classesStudents = []; //students for this class
			schoolStudents = []; //students for this school

			for (index in students) {
    		if (selectedItem.school_id === students[index].school_id || selectedItem.type === 'District') {
    			schoolStudents.push(students[index]);
    		}
    		if (selectedItem.course_id === students[index].course_id || selectedItem.type === 'District') {
    			classesStudents.push(students[index]);
    		}
		  }

			schoolClasses = []; // classes for this school
			studentsClasses = []; // classes for this student
			teachersSchedule = []; // classes for this teacher

			for (index in classes) {
    		if (selectedItem.school_id === classes[index].school_id || selectedItem.type === 'District') {
    			schoolClasses.push(classes[index]);
    		}
    		// if (selectedItem.course_id === classes[index].course_id || selectedItem.type === 'District') {
    		// 	if (selectedItem.type === "student") {
				// 		// this doesn't work either
				// 		studentsClasses.push(classes[index]);
    		// 	} else {
				// 		// this is never hit
    		// 		teachersSchedule.push(classes[index]);
    		// 	}
	      // 	}
				// added this
				if (selectedItem.user_id === classes[index].user_id) {
					teachersSchedule.push(classes[index]);
				}
    	}

			// get the class list for a student if one is selected
			if (selectedItem.type === 'student' && selectedItem.user_id) {
				var result = _.find(students, { user_id: selectedItem.user_id });
				var courseArr = _.has(result, 'all_courses') ? result.all_courses : [];
				for (index in courseArr) {
					var courseDetails = _.find(classes, { course_id: courseArr[index] });
					if (courseDetails) studentsClasses.push(courseDetails);
				}
			}

    	State.set('schoolTeachers', schoolTeachers);
    	State.set('classesTeachers', classesTeachers);
    	State.set('schoolStudents', schoolStudents);
    	State.set('classesStudents', classesStudents);
    	State.set('schoolClasses', schoolClasses);
    	State.set('studentsClasses', studentsClasses);
    	State.set('teachersSchedule', teachersSchedule);
			State.set('students', students);
			State.set('teachers', teachers);
			console.log('data-manager teachers', teachers);

			State.set('administrators', administrators);
			PubSub.publish('tableDataChanged');
		}
	}

	init();

	function setActiveTable ( data ) {
		_.forEach(ViewDefinitions.get(), function(entry) {
			if (entry.id === data.id) {
				activeTable = entry;
			}
		});
	}

	function getActiveTable() {
		console.log('active table: ', activeTable);
		return activeTable;
	}



	// save data

	function saveData( oldData, newData, uniqueIDs, stateToSet) {

      for (var key in oldData) {
      		if (oldData[key].user_id === newData.user_id) {
      			oldData[key] = newData;
      		}
		}
		State.set( stateToSet, oldData );
	}

	return {
		loadInfoData: loadInfoData,
		saveData: saveData,
		setActiveTable: setActiveTable,
		getActiveTable: getActiveTable,
		setFilter: setFilter,
		init: init,
		hasInitialized: hasInitialized
	};

};
