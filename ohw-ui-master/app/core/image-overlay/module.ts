'use strict';

import qImage from './q-image-directive.ts';

export default angular.module('core.qimage', [])
	.directive('qimg', qImage);
