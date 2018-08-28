'use strict';

import saveButton from './save-button-directive.ts';


export default angular.module('core.savebutton', [])
	.directive('saveButton', saveButton);
