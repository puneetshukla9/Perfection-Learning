'use strict';

import manageClassesCtrl from './manage-classes/manage-classes-controller.ts';
import manageStudentsCtrl from './manage-students/manage-students-controller.ts';
import manageSchoolsCtrl from './manage-schools/manage-schools-controller.ts';
import manageTeachersCtrl from './manage-teachers/manage-teachers-controller.ts';
import studentUploadCtrl from './student-upload/student-upload-controller.ts';
import teacherUploadCtrl from './teacher-upload/teacher-upload-controller.ts';
import districtLicensesCtrl from './district-licenses/district-licenses-controller.ts';
import plcLicensesCtrl from './plc-licenses/plc-licenses-controller.ts';

export default angular.module('admin.wizards', [])
	.controller('ManageClassesCtrl', manageClassesCtrl)
	.controller('ManageStudentsCtrl', manageStudentsCtrl)
	.controller('ManageSchoolsCtrl', manageSchoolsCtrl)
	.controller('ManageTeachersCtrl', manageTeachersCtrl)
	.controller('StudentUploadWizardCtrl', studentUploadCtrl)
	.controller('TeacherUploadWizardCtrl', teacherUploadCtrl)
	.controller('DistrictLicensesCtrl', districtLicensesCtrl)
	.controller('PLCLicensesCtrl', plcLicensesCtrl);
