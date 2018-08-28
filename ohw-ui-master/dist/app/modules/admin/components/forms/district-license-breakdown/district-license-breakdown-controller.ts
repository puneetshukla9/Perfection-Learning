'use strict';

export default function(Config, AdminData, $rootScope, $scope, $stateParams, State, SchoolHelper) {

		var self = this;
		var keyStr = $stateParams.id;
		var keys = keyStr.split('_');
		var district_id = keys[0];
		var product_id = parseInt(keys[1], 10);

		$scope.init = function() {
			$scope.license = getLicenseName();
			if (State.get('license_distribution')) {
				populateList();
			}
		};

		$scope.init();

		// License Distribution. State value for license_distribution needs to be filtered for school and license / product ID.
		function getLicenseDistribution() {
			var school_ids = _.map(State.get('schools'), (school) => { return school.school_id; });
			var license_distribution = State.get('license_distribution') || {};

			license_distribution = Object.values(license_distribution);
			license_distribution = _.filter(license_distribution, (item) => { return school_ids.indexOf(item.school_id) !== -1; });
			license_distribution = _.filter(license_distribution, (item) => { return item.product_id === product_id; });
			return license_distribution;
		}

		// Get name of license for which detail is requested.
		function getLicenseName() {
			var district_licenses = State.get('district_licenses');
			var licenses = _.filter(district_licenses, (item) => { return item.id === product_id; });
			var license = licenses[0].license;
			license = license.replace(' Student License', '');
			return license;
		}

		// Use license distribution data to compile list of schools and student count for each.
		function getSchoolData(distribution) {
			var data = [];
			_.each(distribution, (item) => {
				data.push({
					name: item.school_name,
					student_count: item.student_count
				});
			});
			data.sort(SchoolHelper.sortBySchool);
		 	return data;
		}

		// Use license distribution data to calculate totals used and available.
		function calculateTotals(distribution) {
			var total_used = 0;
			var seats_purchased = distribution[0].seats_purchased;
			var totals = {};
			_.each(distribution, (item) => {
				total_used += item.student_count;
			});
			totals.used = total_used;
			totals.available = seats_purchased - total_used;
			return totals;
		}

		function populateList() {
			var license_distribution = getLicenseDistribution();
			if (license_distribution.length > 0) {
				// Armed with district ID, we need the name of each school in the district and the seats used for the selected license.
				// We also need to know which license.
				$scope.schools = getSchoolData(license_distribution);
				var totals = calculateTotals(license_distribution);
				$scope.total_used = totals.used;
				$scope.total_available = totals.available;
			} else {
				var licenses = State.get('licenses');
				var filteredLicense = _.filter(licenses, (item) => { return item.product_id === product_id; });
				var license = filteredLicense.length > 0 ? filteredLicense[0] : {seats_used: 0, remaining_seats: 0};
				$scope.total_used = license.seats_used;
				$scope.total_available = license.remaining_seats;
			}
		}

		$rootScope.$on('initial fetch complete', populateList);

};
