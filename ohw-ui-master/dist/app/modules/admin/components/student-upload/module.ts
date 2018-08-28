'use strict';

import './grid-correct/grid-correct.less';
import './student-upload.less';

import uploadConfirmCtrl from './controllers/confirm-controller.ts';
import instructionsCtrl from './controllers/instructions-controller.ts';
import tableCtrl from './controllers/table-controller.ts';
import gridCorrectColumn from './grid-correct/grid-correct-column-directive.ts';
import csvService from './student-upload-csv-service.ts';
import genService from './student-upload-generator-service.ts';
import valService from './student-upload-validation-service.ts';

export default angular.module('admin.studentupload', [])
	.service('StudentUploadCSV', csvService)
	.service('StudentUploadGenerator', genService)
	.service('StudentUploadValidation', valService)
	.directive('gridCorrectColumn', gridCorrectColumn)
	.controller('UploadConfirmCtrl', uploadConfirmCtrl)
	.controller('StudentUploadCtrl', instructionsCtrl)
	.controller('StudentUploadTableCtrl', tableCtrl);
