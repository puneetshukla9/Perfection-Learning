'use strict';

import APIInterceptor from './config/api-interceptor.ts';
import APIConfig from './config/api-config.ts';
import adminsModel from './models/admins/admins-model.ts';
import adminsHelper from './models/admins/admins-helper.ts';
import assignModel from './models/assignments/assignment-model.ts';
import assignHelper from './models/assignments/assignment-helper.ts';
import authModel from './models/auth/auth-model.ts';
import courseModel from './models/course/course-model.ts';
import courseHelper from './models/course/course-helper.ts';
import districtModel from './models/district/district-model.ts';
import gradeModel from './models/grades/grade-model.ts';
import licenseModel from './models/license/license-model.ts';
import licenseHelper from './models/license/license-helper.ts';
import reportsModel from './models/reports/reports-model.ts';
import schoolModel from './models/school/school-model.ts';
import schoolHelper from './models/school/school-helper.ts';
import stateFactory from './state-factory.ts';
import studentModel from './models/student/student-model.ts';
import studentHelper from './models/student/student-helper.ts';
import teacherModel from './models/teacher/teacher-model.ts';
import teacherHelper from './models/teacher/teacher-helper.ts';
import userModel from './models/user/user-model.ts';
import userHelper from './models/user/user-helper.ts';
import userValidation from './models/user/user-validation-factory.ts';
import utilModel from './models/util/util-model.ts';
import bookshelfModel from './models/bookshelf/bookshelf-model.ts';
import bookshelfHelper from './models/bookshelf/bookshelf-helper.ts';

export default angular.module('core.api', [])
	.factory('APIInterceptor', APIInterceptor)
	.factory('API', APIConfig)
	.factory('Admin', adminsModel)
	.factory('AdminHelper', adminsHelper)
	.factory('Assignment', assignModel)
	.factory('AssignmentAPIHelper', assignHelper)
	.factory('Auth', authModel)
	.factory('Course', courseModel)
	.factory('CourseHelper', courseHelper)
	.factory('District', districtModel)
	.factory('Grade', gradeModel)
	.factory('License', licenseModel)
	.factory('LicenseHelper', licenseHelper)
	.factory('Report', reportsModel)
	.factory('School', schoolModel)
	.factory('SchoolHelper', schoolHelper)
	.factory('State', stateFactory)
	.factory('Student', studentModel)
	.factory('StudentHelper', studentHelper)
	.factory('Teacher', teacherModel)
	.factory('TeacherHelper', teacherHelper)
	.factory('User', userModel)
	.factory('UserHelper', userHelper)
	.factory('UserValidation', userValidation)
	.factory('Bookshelf', bookshelfModel)
	.factory('BookshelfHelper', bookshelfHelper)
	.factory('Util', utilModel);
