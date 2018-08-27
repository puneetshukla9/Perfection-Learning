'use strict';

import tableDefaults from './table-defaults-factory.ts';
import './table.less';

angular.module('core.table', [])
	.factory('TableDefaults', tableDefaults)
	.constant('TableConfig', {
		PATH: 'table/'
	});
