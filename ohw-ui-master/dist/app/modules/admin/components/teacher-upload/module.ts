'use strict';

import './grid-correct/grid-correct.less';
import './teacher-upload.less';

import uploadConfirmCtrl from './controllers/confirm-controller.ts';
import instructionsCtrl from './controllers/instructions-controller.ts';
import tableCtrl from './controllers/table-controller.ts';
import gridCorrectColumn from './grid-correct/grid-correct-column-directive.ts';
import csvService from './teacher-upload-csv-service.ts';
import genService from './teacher-upload-generator-service.ts';
import valService from './teacher-upload-validation-service.ts';

export default angular.module('admin.teacherUpload', [])
	.service('TeacherUploadCSV', csvService)
	.service('TeacherUploadGenerator', genService)
	.service('TeacherUploadValidation', valService)
	.directive('gridCorrectColumn', gridCorrectColumn)
	.controller('UploadConfirmCtrl', uploadConfirmCtrl)
	.controller('TeacherUploadCtrl', instructionsCtrl)
	.controller('TeacherUploadTableCtrl', tableCtrl);
