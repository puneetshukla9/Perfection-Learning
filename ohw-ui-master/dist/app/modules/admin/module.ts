'use strict';

var printPreviewTemplate = require('./../../core/print-preview/print-preview.html');

import 'angular-ui-router';
import 'angular-ui-bootstrap';
import 'angular-ui-grid/ui-grid';

import './components/actions/module.ts';
import './components/dialog/module.ts';
import './components/forms/module.ts';
import './components/student-upload/module.ts';
import './components/teacher-upload/module.ts';
import './components/bookshelf/module.ts';
import './components/table/module.ts';
import './components/wizards/module.ts';
import './components/search-filter/module.ts';
import './components/school-dropdown/module.ts';
import './components/external-link/module.ts';

import './less/master.less';

import classRoster from './../assignments/components/models/class-roster-model.ts';
import adminData from './components/data-manager-service.ts';
import viewDefinitions from './components/view-definitions-config.ts';
import config from './components/config-model-factory.ts';

export default angular.module('admin', [
	'ui.grid',
	'ui.grid.selection',
	'ui.grid.pagination',
	'ui.grid.autoResize',
	'ui.grid.importer',
	'ui.grid.rowEdit',
	'ui.grid.edit',
	'ui.grid.exporter',
	'ui.bootstrap.datetimepicker',
	'admin.actions',
	'admin.external',
	'admin.dialog',
	'admin.forms',
	'admin.studentupload',
	'admin.teacherUpload',
	'admin.bookshelf',
	'admin.table',
	'admin.wizards',
	'admin.searchfilter',
	'admin.schooldropdown'
])
.service('AdminData', adminData)
.factory('ViewDefinitions', viewDefinitions)
.factory('Config', config)
.service('ClassRoster', classRoster)
.config(function($qProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
	$qProvider.errorOnUnhandledRejections(false);

	$stateProvider

		.state('adminApp', {
			url: '/admin',
			templateUrl: require('./app.html')
		})

		.state('adminApp.book', {
			params: { url: '/books/fpp/Chapters/index.html' },
			url: '/book',
			controller: 'ExternalCtrl as ctrl'
		})

		.state('adminApp.addClass', {
			url: '/class/add',
			templateUrl: require('./components/forms/add-class/add-class.html'),
			controller: 'AddClassCtrl as ctrl'
		})

		.state('adminApp.addStudent', {
			url: '/student/add',
			templateUrl: require('./components/forms/add-user/user-create.html'),
			controller: 'AddUserCtrl'
		})

		.state('adminApp.addTeacher', {
			url: '/teacher/add',
			templateUrl: require('./components/forms/add-user/user-create.html'),
			controller: 'AddUserCtrl'
		})

/*
		.state('adminApp.licenseList', {
			url: '/licenseList',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})
*/
		// -- student upload flow --
		.state('adminApp.studentUpload', {
			url: '/upload-wizard',
			templateUrl: require('./components/wizards/student-upload/student-upload.html'),
			controller: 'StudentUploadWizardCtrl'
		})

		.state('adminApp.studentUpload.uploadInstructions', {
			url: '/upload',
			templateUrl: require('./components/student-upload/templates/instructions.html'),
			controller: 'StudentUploadCtrl as ctrl'
		})

		.state('adminApp.studentUpload.uploadConfirm', {
			url: '/confirm',
			params: { data: null, changes: null },
			templateUrl: require('./components/student-upload/templates/usernames-and-passwords.html'),
			controller: 'UploadConfirmCtrl as ctrl'
		})

		.state('adminApp.studentUpload.uploadTable', {
			url: '/table',
			params: { data: null, changes: null },
			templateUrl: require('./components/student-upload/templates/table.html'),
			controller: 'StudentUploadTableCtrl as ctrl'
		})

		// -- student upload end --

		// -- begin student flow --

		.state('adminApp.students', {
			url: '/student-wizard',
			templateUrl: require('./components/wizards/manage-students/manage-students.html'),
			controller: 'ManageStudentsCtrl'
		})

		.state('adminApp.students.studentsList', {
			url: '/list',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.students.editStudent', {
			url: '/edit/:id',
			params: { id: null },
			templateUrl: require('./components/forms/edit-student/edit-student.html'),
			controller: 'EditStudentCtrl as ctrl'
		})

		// -- end student flow --

		// -- begin teacher flow --

		.state('adminApp.teachers', {
			url: '/teacher-wizard',
			templateUrl: require('./components/wizards/manage-teachers/manage-teachers.html'),
			controller: 'ManageTeachersCtrl'
		})

		.state('adminApp.teachers.teachersList', {
			url: '/list',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.teachers.editTeacher', {
			url: '/edit/:id',
			params: { id: null },
			templateUrl: require('./components/forms/edit-teacher/edit-teacher.html'),
			controller: 'EditTeacherCtrl as ctrl'
		})

		// -- end teacher flow --

		// -- teacher upload flow --
		.state('adminApp.teacherUpload', {
			url: '/upload-teacher-wizard',
			templateUrl: require('./components/wizards/teacher-upload/teacher-upload.html'),
			controller: 'TeacherUploadWizardCtrl'
		})

		.state('adminApp.teacherUpload.uploadInstructions', {
			url: '/upload-teacher',
			templateUrl: require('./components/teacher-upload/templates/instructions.html'),
			controller: 'TeacherUploadCtrl as ctrl'
		})

		.state('adminApp.teacherUpload.uploadConfirm', {
			url: '/confirm-teacher',
			params: { data: null, changes: null },
			templateUrl: require('./components/teacher-upload/templates/usernames-and-passwords.html'),
			controller: 'UploadConfirmCtrl as ctrl'
		})

		.state('adminApp.teacherUpload.uploadTable', {
			url: '/table',
			params: { data: null, changes: null },
			templateUrl: require('./components/teacher-upload/templates/table.html'),
			controller: 'TeacherUploadTableCtrl as ctrl'
		})

		// -- student upload end --


		// -- begin class flow --

		.state('adminApp.selectExisting', {
			url: '/select-existing',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.classes', {
			url: '/class-wizard',
			templateUrl: require('./components/wizards/manage-classes/manage-classes.html'),
			controller: 'ManageClassesCtrl'
		})

		.state('adminApp.classes.classesList', {
			url: '/list',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.classes.editClass', {
			url: '/edit/:id',
			params: { id: null },
			templateUrl: require('./components/forms/edit-class/edit-class.html'),
			controller: 'EditClassCtrl as ctrl'
		})

		.state('adminApp.classes.classesStudents', {
			url: '/roster/:id',
			params: { id: null },
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		// -- end class flow --

		// -- begin bookshelf --
/*
		.state('adminApp.bookshelf', {
			url: '/bookshelf-wizard',
			templateUrl: require('./components/wizards/manage-bookshelf/manage-bookshelf.html'),
			controller: 'ManageBookshelfCtrl'
		})

		.state('adminApp.bookshelf.userBookshelf', {
			templateUrl: require('./components/bookshelf/user-bookshelf.html'),
			url: '/bookshelf',
			controller: 'UserBookshelfCtrl as ctrl'
		})

		.state('adminApp.bookshelf.bookRead', {
			url: '/read/:bookId',
			params: { bookId: null },
			templateUrl: require('./components/bookshelf/book-read.html'),
			controller: 'BookReadCtrl as ctrl'
		})
*/
		.state('adminApp.classes.bookshelf', {
			url: '/bookshelf/:id',
			params: { id: null, forClass: true },
			templateUrl: require('./components/bookshelf/bookshelf.html'),
			controller: 'BookshelfCtrl as ctrl'
		})

		// -- end bookshelf

		.state('adminApp.printPreview', {
			url: '/print-preview',
			controller: 'PrintPreviewCtrl',
			templateUrl: printPreviewTemplate,
			params: {
				data: null
			}
		})

		.state('adminApp.schoolsTeachers', {
			url: '/schoolsTeachers',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.classesTeachers', {
			url: '/classesTeachers',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.teachersSchedule', {
			url: '/teachersSchedule',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.studentsSchedule', {
			url: '/studentsSchedule',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		// -- district admin license breakdown for schools in district --
		.state('adminApp.licenses', {
			url: '/license-wizard',
			templateUrl: require('./components/wizards/district-licenses/district-licenses.html'),
			controller: 'DistrictLicensesCtrl'
		})

		.state('adminApp.licenses.licenseList', {
			url: '/list',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.licenses.districtLicenseList', {
			url: '/district/:id',
			params: { id: null },
			templateUrl: require('./components/forms/district-license-breakdown/district-license-breakdown.html'),
			controller: 'DistrictLicenseBreakdownCtrl as ctrl'
		})

		// -- plc admin license edit --
		.state('adminApp.plcLicenses', {
			url: '/plc-license-wizard',
			templateUrl: require('./components/wizards/plc-licenses/plc-licenses.html'),
			controller: 'PLCLicensesCtrl'
		})

		.state('adminApp.plcLicenses.licenseList', {
			url: '/list',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		})

		.state('adminApp.plcLicenses.editLicense', {
		  url: '/plclicense/:id',
			params: { id: null },
			templateUrl: require('./components/forms/plc-edit-license/plc-edit-license.html'),
			controller: 'PLCEditLicenseCtrl as ctrl'
		})

		// -- district admin schools --
		.state('adminApp.schools', {
			url: '/school-wizard',
			templateUrl: require('./components/wizards/manage-schools/manage-schools.html'),
			controller: 'ManageSchoolsCtrl'
		})

		.state('adminApp.schools.schoolsList', {
			url: '/list',
			templateUrl: require('./components/table/table.html'),
			controller: 'kbTableCtrl as ctrl'
		});

});
