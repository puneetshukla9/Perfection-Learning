'use strict';

import addClass from './add-class/add-class-controller.ts';
import addUser from './add-user/user-create-controller.ts';
import editClass from './edit-class/edit-class-controller.ts';
import editStudent from './edit-student/edit-student-controller.ts';
import editTeacher from './edit-teacher/edit-teacher-controller.ts';
import districtLicenseBreakdown from './district-license-breakdown/district-license-breakdown-controller.ts';
import plcEditLicense from './plc-edit-license/plc-edit-license-controller.ts';

export default angular.module('admin.forms', [])
	.controller('AddClassCtrl', addClass)
	.controller('AddUserCtrl', addUser)
	.controller('EditClassCtrl', editClass)
	.controller('EditStudentCtrl', editStudent)
	.controller('EditTeacherCtrl', editTeacher)
	.controller('DistrictLicenseBreakdownCtrl', districtLicenseBreakdown)
	.controller('PLCEditLicenseCtrl', plcEditLicense);
