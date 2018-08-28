'use strict';

export default function($rootScope, Config, License, $q) {

	var self = this;

	function init() {
		var promiseArr = [
			License.getAllLicenses({ products: Config.PRODUCTS_FOR_LICENSE })
		];

		return $q.all(promiseArr).then(function(res) {
			$rootScope.$broadcast('StateChange:products');
		});

	}

	init();
};
