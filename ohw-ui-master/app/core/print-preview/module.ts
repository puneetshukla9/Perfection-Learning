'use strict';

import printPreview from './print-preview-controller.ts';
import './print-preview.less';

export default angular.module('core.printpreview', [])
	.controller('PrintPreviewCtrl', printPreview);
