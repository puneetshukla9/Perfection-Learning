'use strict';

export default function(AppState, State, Course, Config, User, uiGridConstants, License, LicenseHelper) {

		var ViewDefinitions = {};
		var isDistAdmin = AppState.get('isDistAdmin');
		var isPLCAdmin = AppState.get('isPLCAdmin');

		var admToPlcTable = {
			'adminApp.students.studentsList': 'plcAdminApp.users.usersList'
		};

		function admToPlc(id) {
			if (admToPlcTable[id]) {
				return admToPlcTable[id];
			} else {
				return id;
			}
		}

		ViewDefinitions.get = function() {
			return ViewDefinitions.data;
		};

		ViewDefinitions.getById = function(id) {
			if (isPLCAdmin) {
				id = admToPlc(id);
			}
			return _.find(ViewDefinitions.data, { id: id });
		};

		// Make adjustments to data grid configuration. The id corresponds to the id property in each element of ViewDefinitions.data.
		ViewDefinitions.adjustForId = function(id, adjustments) {
			var def = ViewDefinitions.getById(id);
			Object.assign(def, adjustments);
		};

		// Make adjustments to grid columns. These are handled separately from general configuration, since the columns are an array.
		ViewDefinitions.adjustColsForId = function(id, cols) {
			var def = ViewDefinitions.getById(id);
			_.each(cols, (obj, ndx) => {
				def.gridOptions.columnDefs[ndx] = obj;
			});
		};

		// Configuration for each of several views that use the Table Controller.
	  ViewDefinitions.data = [
			{
				id: 'adminApp.licenses.licenseList',
				name: 'Manage All Licenses',
				actions: {},
				gridSource: 'district_licenses',
				gridSourceTransform: (licenses) => { return licenses; },
				gridOptions: {
					enableFiltering: false,
					columnDefs: [{
						name: 'name',
						field: 'license'
					}, {
						name: 'school',
						field: 'school_name'
					}, {
						name: 'available',
						field: 'remaining_seats',
						width: 90
					}, {
						name: 'used',
						field: 'seats_used',
						width: 90
					}, {
						name: 'start',
						field: 'start_date',
						width: 100
					}, {
						name: 'end',
						field: 'expire_date',
						width: 100
					}]
				}
			},

			{
				id: 'adminApp.plcLicenses.licenseList',
				name: 'Manage All Licenses',
				actions: {},
				noResultsMessage: 'Use the filter to search by school, order#, or license.',
				gridSource: 'licenses',
				gridSourceTransform: (licenses) => { return licenses; },
				gridSourceFetch: License.plcLicenseSearch,
				gridSourceFetchKey: 'term',
				drillDest: 'adminApp.plcLicenses.editLicense',
				drillUniqueId: 'sb_id',

				searchFilterFields : [
					'school', 'school_name'
				],
				gridOptions: {
					enableFiltering: false,
					columnDefs: [{
						name: 'name',
						field: 'license'
					}, {
						name: 'institution',
						field: 'school_name'
					}, {
						name: 'available',
						field: 'remaining_seats',
						width: 90
					}, {
						name: 'end date',
						field: 'expire_date',
						width: 100
					}, {
						name: 'order',
						field: 'ordersid',
						width: 90
					}]
				}
			},

			{
				id: 'adminApp.schools.schoolsList',
				name: 'Manage All Schools',
				actions: {
					'actions': [{
						'action': 'teacherRegistration',
						'label': 'Teacher Access Information'
					}]
				},
				searchFilterFields : [
					'name', 'district_name'
				],
				gridSource: 'schools',
				gridSourceTransform: (schools) => {
					return _.filter(schools, (school) => {
						return school.treat_as_district === false;
					});
				},
				gridOptions: {
					enableFiltering: false,
					multiSelect: false,
					columnDefs: [{
						name: 'name',
						field: 'name'
					}, {
						name: 'district',
						field: 'district_name'
					}]
				}
			},

			{
        id: 'plcAdminApp.users.usersList',
        name: 'User Search',
        actions: {
        },
				noResultsMessage: 'Use the filter to enter email or user name.',
				showSchoolDropdown: showSchoolDropdown,
				gridSourceFetch: User.plcUserSearch,
				gridSourceFetchKey: 'term',
        gridSource: 'plcUsers',
        gridOptions: {
          enableFiltering: false,
          columnDefs: [{
            name: 'lastName',
            field: 'last_name',
						displayName: 'Last',
						sort: {
							direction: uiGridConstants.ASC
						}
          }, {
            name: 'firstName',
            field: 'first_name',
						displayName: 'First'
          }, {
            name: 'username',
            field: 'email'
          }, {
            name: 'userType',
            field: 'usertypename',
            displayName: 'User Type'
          }, {
            name: 'schoolName',
            field: 'name',
            displayName: 'School'
          }]
        },
				searchFilterFields : [
					'firstName', 'lastName', 'email', 'userType', 'school'
				],
				drillDest: 'adminApp.students.editStudent',
				drillUniqueId: 'user_id',
				drillField: 'student'
      },

			{
        id: 'adminApp.students.studentsList',
        name: 'Manage All Students',
        oneRosterLock: true,
        actions: {
          'actions': [
            {
              'action': 'deleteStudents',
              'label': 'Delete'
            }
						// {
            //   'action': 'resetPassword',
            //   'label': 'Reset Password'
            // }
          ]
        },
				showSchoolDropdown: showSchoolDropdown,
        gridSource: 'students',
        gridOptions: {
          enableFiltering: false,
          columnDefs: [{
            name: 'lastName',
            field: 'last',
						sort: {
							direction: uiGridConstants.ASC
						}
          }, {
            name: 'firstName',
            field: 'first'
          }, {
            name: 'username',
            field: 'email'
          }, {
            name: 'studentId',
            field: 'student_num',
            displayName: 'Student ID'
          }]
        },
				columnsForDistrAdmin: [
					{
						name: 'school',
						field: 'school_name',
						displayName: 'School',
						width: '*'
					}
				],
				searchFilterFields : [
					'first', 'last', 'email', 'student_num'
				],
				searchFilterFieldsDistrAdmin: [
					'school_name'
				],
        drillDest: 'adminApp.students.editStudent',
        drillUniqueId: 'user_id',
        drillField: 'student'
      },

			{
        id: 'adminApp.teachers.teachersList',
        name: 'Manage All Teachers',
        oneRosterLock: true,
        actions: {
          'actions': [
            {
              'action': 'deleteTeachers',
              'label': 'Delete'
            }
          ]
        },
				gridSourceFetch: isPLCAdmin ? User.plcUserSearch : null,
				gridSourceFetchKey: isPLCAdmin ? 'term' : null,
        gridSource: isPLCAdmin ? 'plcUsers' : 'teachers',
        gridOptions: {
          enableFiltering: false,
          columnDefs: [{
            name: 'lastName',
            field: isPLCAdmin ? 'last_name' : 'last',
						sort: {
							direction: uiGridConstants.ASC
						}
          }, {
            name: 'firstName',
            field: isPLCAdmin ? 'first_name' : 'first'
          }, {
            name: 'username',
            field: 'email'
          }]
        },
				columnsForDistrAdmin: [
					{
						name: 'school',
						field: isPLCAdmin ? 'name' : 'school_name',
						displayName: 'School',
						width: '*'
					}
				],
				searchFilterFields : [
					'first', 'last', 'email', 'school_name'
				],
        drillDest: 'adminApp.teachers.editTeacher',
        drillUniqueId: 'user_id',
        drillField: 'teacher'
      },

			{
        id: 'adminApp.classes.classesList',
        name: 'Manage All Classes',
        oneRosterLock: true,
        noResultsMessage: 'No results to display',
        actions: {
          'actions': [{
            'action': 'deleteClass',
            'label': 'Delete'
          }]
        },
				showSchoolDropdown: showSchoolDropdown,
        gridSource: 'classes',
        gridOptions: {
          enableFiltering: false,
          enableRowHeaderSelection: true,
          multiSelect: false,
          columnDefs: [{
            name: 'className',
            field: 'name',
            width: '*'
          }, {
            name: 'teacher',
            field: 'teacher',
            width: '*'
          }, {
            name: 'license',
            field: 'license',
            width: '*'
          }, {
            name: 'students',
            field: 'student_count',
            width: '*'
          }]
        },
				columnsForDistrAdmin: [
					{
						name: 'school',
						field: 'school_name',
						displayName: 'School',
						width: '*'
					}
				],
				searchFilterFields : [
					'name', 'teacher', 'license', 'student_count'
				],
				searchFilterFieldsDistrAdmin: [
					'school_name'
				],
        drillDest: 'adminApp.classes.editClass',
        drillUniqueId: 'course_id',
        drillField: 'class'
      },

			{
				id: 'adminApp.classes.classesStudents', // roster
				name: 'Class Roster',
				oneRosterLock: true,
				noResultsMessage: 'No results to display',
				actions: {
					actions: [{
						'action': 'dropStudentFromClass',
						'label': 'Drop from Class'
					}, {
						'action': 'printStudentUsername',
						'label': 'Print Student Access Information'
					}],
					moreActions: [
					{
						'action': 'resetCode',
						'label': 'Reset Code'
					}]
				},
				filter: {
					label: 'Classes',
					active: 'class',
					uniqueID: 'course_id',
					displayName: 'name',
					applyFilterToTable: false
				},
				filterSource: 'classes',
				gridSource: 'classesStudents',
				gridSourceFetch: Course.getStudentListById,
				gridSourceFetchKey: 'id',
				searchFilterFields : [
					'first', 'last', 'email'
				],
				gridOptions: {
					enableFiltering: false,
					columnDefs: [{
            name: 'lastName',
            field: 'last',
						sort: {
							direction: uiGridConstants.ASC
						}
          }, {
						name: 'firstName',
						field: 'first'
					}, {
						name: 'username',
						field: 'email'
					}]
				}
			},

			{
				id: 'adminApp.selectExisting',
				name: 'Select Students',
				actions: {
					actions: [
					 {
						'action': 'assignClass',
						'label': 'Add to Class'
					}]
				},
				oneRosterLock: true,
				showSchoolDropdown: showSchoolDropdown,
				gridSource: 'students',
				gridSourceFetch: '',
				gridSourceFetchKey: '',
				searchFilterFields : [
					'first', 'last', 'email'
				],
				gridOptions: {
					enableFiltering: false,
					columnDefs: [{
            name: 'lastName',
            field: 'last',
						sort: {
							direction: uiGridConstants.ASC
						}
          }, {
						name: 'firstName',
						field: 'first'
					}, {
						name: 'username',
						field: 'email'
					}, {
						name: 'studentId',
						field: 'student_num',
						displayName: 'Student ID'
					}]
				},
				columnsForDistrAdmin: [
					{
						name: 'school',
						field: 'school_name',
						displayName: 'School',
						width: '*'
					}
				],
				searchFilterFieldsDistrAdmin: [
					'school_name'
				]
			}
		];

/*
	Use the following functions to specify adjustments to be made to the above data grid configuration.
*/

		// Adjust Manage All Licenses for District Admin.
		function licenseGridDef() {
			ViewDefinitions.adjustForId('adminApp.licenses.licenseList', {
				drillDest: 'adminApp.licenses.districtLicenseList',
				drillUniqueId: 'district_product'
			});
			ViewDefinitions.adjustColsForId('adminApp.licenses.licenseList', {
						1: {
							name: 'district',
							field: 'district_name'
						}
			});
		}

		// Adjust Manage All Classes for District Admin.
		function classesGridDef() {
			ViewDefinitions.adjustForId('adminApp.classes.classesList', {
				gridSource: 'district_classes',
				actions: {
					'actions': [{
            'action': 'deleteClass',
            'label': 'Delete'
          }],
					selectSchool: true
				}
			});
		}


		function selectStudentGridDef() {
			ViewDefinitions.adjustForId('adminApp.selectExisting', {
			actions: {
					actions: [
					 {
						'action': 'assignClass',
						'label': 'Add to Class'
					}],
					selectSchool: true
				}
			});
		}

		function showSchoolDropdown() {
			var schools = State.get('schools') || [];
			var showDropdown = isPLCAdmin || isDistAdmin && schools[0] && schools[0].treat_as_district || false;
			return showDropdown;
		}

		// Specify adjustments to be made if user is PLC or District Admin.
		if (isPLCAdmin) {
			licenseGridDef();
			selectStudentGridDef();
		} else if (!isPLCAdmin && isDistAdmin) {
			licenseGridDef();
			classesGridDef();
			selectStudentGridDef();
		}

		return ViewDefinitions;

	};
