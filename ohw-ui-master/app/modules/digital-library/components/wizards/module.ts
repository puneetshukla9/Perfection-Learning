'use strict';

import manageBookshelfCtrl from './manage-bookshelf/manage-bookshelf-controller.ts';

export default angular.module('digitalLibrary.wizards', [])
	.controller('ManageBookshelfCtrl', manageBookshelfCtrl);
