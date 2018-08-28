'use strict';

var template = require('./product-list-menu.html');

export default function(LicenseHelper, State, $rootScope) {

		var lastSelection = null;
		var unbindHandler;

		function buildLicenseList(licenses) {
			licenses = _.uniqBy(licenses, 'product_id');
			var opts = LicenseHelper.filterSharedData(licenses);
			return opts;
		}

		return {
			restrict: 'A',
			scope: true,
			templateUrl: template,
			replace: true,
			link: function(scope, elem, attrs) {

				if (unbindHandler) unbindHandler();
				unbindHandler = $rootScope.$on('StateChange:products', function() {
					var licenses = State.get('licenses');
					scope.sharedLicenses = buildLicenseList(licenses);
					if (lastSelection) {
						scope.selectedItem = lastSelection;
						$rootScope.$broadcast('Dropdown:sharedAssignmentsProduct', { book_id: scope.selectedItem.product_id });
					} else {
						scope.selectedItem = scope.sharedLicenses[0];
					}
				});

				scope.visible = true;

				scope.assignmentdetails = attrs.details ? true : false;

				var loaded = loaded || false;

				// changed from menu
				scope.productFilter = () => {
					lastSelection = scope.selectedItem;
					$rootScope.$broadcast('Dropdown:sharedAssignmentsProduct', { book_id: scope.selectedItem.product_id });
				};

			}
		};

	};
