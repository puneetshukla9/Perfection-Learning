'use strict';

export default function(Config, AdminData, $rootScope, Calendar, $scope, $stateParams, State, License) {

		var self = this;
		var sb_id = parseInt($stateParams.id, 10);
    var licenseFilter = State.get('licenses').filter((item) => {
      return parseInt(item.sb_id, 10) === sb_id;
    });
    var licenseObj = licenseFilter[0];

		$scope.init = function() {
    console.log('PLC Edit license', licenseObj);
      $scope.license = licenseObj.license;
      $scope.seats_purchased = licenseObj.seats_purchased;
      $scope.remaining_seats = licenseObj.remaining_seats;
      $scope.ordersid = licenseObj.ordersid;
      $scope.start_date = licenseObj.start_date;
      $scope.expire_date = licenseObj.expire_date;
      $scope.key = licenseObj.sb_key_plain;
      $scope.b_link = licenseObj.b_link;
      $scope.walength = licenseObj.walength;
      $scope.school_name = licenseObj.school_name;

		};

		$scope.init();

		$scope.checkSave = function(field) {
			if (field === 'seats_purchased') {
				var diff = $scope.seats_purchased - licenseObj.seats_purchased;
				$scope.remaining_seats = licenseObj.remaining_seats + diff;
			}

			var payload = {};
			payload[field] = $scope[field];
			License.plcLicenseEdit(sb_id, payload).then((res) => {
				console.log('saved', field, $scope[field]);
			});
		};

		self.calendar = Calendar;
//		$rootScope.$on('initial fetch complete', populateList);

};
