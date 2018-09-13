'use strict';

var template = require('./shared-by-menu.html');

export default function(AppState, State, $rootScope) {

		var loggedIn = AppState.get('user_id');
		var unbindHandler;
		var sharedBy;

		function sortByFirstName(a, b) {
			if (a.first < b.first) {
				return -1;
			} else if (a.first > b.first) {
				return 1;
			} else {
				if (a.last < b.last) {
					return -1;
				} else if (a.last > b.last) {
					return 1;
				} else {
					return 0;
				}
			}
		}

	  function buildUsers(data) {
			data = _.uniqBy(data, 'id');
			data = data.filter((item) => { return item.id !== loggedIn; }).sort(sortByFirstName);

			var excludeUser = {
				id: -2,
				name: 'All except my assignments'
			};
			var excludeAllOthers = {
				id: loggedIn,
				name: 'Only my assignments'
			};

			var users = [excludeUser, excludeAllOthers];
			_.each(data, item => {
			  users.push({
					id: item.id,
					name: item.first + ' ' + item.last
				});
			});

			return users;
		}

		return {
			restrict: 'A',
			scope: true,
			templateUrl: template,
			replace: true,
			link: function(scope, elem, attrs) {

				// Move code for populating Shared By dropdown into own function.
				// Called on StateChange:sharedBy, but also when directive is first loaded.
				function populateDropdown() {
					var data = State.get('sharedListSharedby');
					scope.sharedby = sharedBy;
					scope.sharedByNames = buildUsers(data);
					if (sharedBy) scope.sharedByFilter();
				}

				var licenses = State.get('licenses');
				if (unbindHandler) unbindHandler();
				unbindHandler = $rootScope.$on('StateChange:sharedBy', populateDropdown);

				populateDropdown();

				scope.visible = true;

				scope.assignmentdetails = attrs.details ? true : false;

				var loaded = loaded || false;

				// changed from menu
				scope.sharedByFilter = () => {
					sharedBy = scope.sharedby ? parseInt(scope.sharedby, 10) : -1;
					$rootScope.$broadcast('Dropdown:sharedBy', { sharedBy: sharedBy });
				};

			}
		};

	};
