'use strict';

var template = require('./module-menu.html');

var options = {};

options.adminApp = require('./../../modules/admin/config/menu-config.json');
options.assignApp = require('./../../modules/assignments/config/menu-config.json');
options.assignGenApp = require('./../../modules/assignment-generator/config/menu-config.json');
options.reportsApp = require('./../../modules/reports/config/menu-config.json');
options.supportApp = require('./../../modules/support/config/menu-config.json');
options.settingsApp = require('./../../modules/settings/config/menu-config.json');
options.gradeChangeApp = require('./../../modules/grade-change/config/menu-config.json');

export default function(AppState, OneRoster, $state, $rootScope) {

		var neverDisabled = ['settingsApp', 'supportApp'];

		var oneRosterLocked = OneRoster.isLockedOut();

		function mustAddClass() {
			var result = false;
/*
			if (!(AppState.get('isDistAdmin') || AppState.get('isPLCAdmin')) &&
			      AppState.get('courses').length === 0 && isNeverDisabled() === false) {
				result = true;
			}
*/
			if (!(AppState.get('isDistAdmin') || AppState.get('isPLCAdmin')) &&
			      AppState.filteredCourses().length === 0 && isNeverDisabled() === false) {
				result = true;
			}
			return result;
		}

		function isNeverDisabled() {
			var name = $state && $state.current && $state.current.name || '';
			var module = name.substr(0, name.indexOf('.'));
			return neverDisabled.indexOf(module) !== -1;
		}

		function isAMSCO() {
			var hasAMSCO = AppState.get('hasAmsco');
			var hasMathX = AppState.get('hasMathx');
			return !!(hasAMSCO && !hasMathX);
		}

		function getOptions(key, product) {
			if (!(key in options)) return;
			var result = options[key].data;
			if (product) {
				result = _.filter(result, (obj) => {
					if (obj.product && obj.product === product) {
						return isPermAllowed(obj);
					} else if (obj.product && obj.product !== product) {
						return false;
					} else {
						return isPermAllowed(obj);
					}
				});

			}

			result = filterListForPerms(result);

			return result;
		}

		function isPermAllowed(mitem) {
			if (!mitem) return;

			var result = mitem;
			var hasTeacherAccess = result.teacherAccess || 'true';
			var hasDAdminAccess = result.distrAdminAccess || 'true';
			var oneRosterLock = oneRosterLocked && result.oneRosterLock || 'false';
			var hasPLCAdminAccess = result.plcAdminAccess || 'true';
			var defaultResult = true;

			if (AppState.get('isPLCAdmin')) {
				defaultResult = hasPLCAdminAccess === 'true';
			} else if (AppState.get('isDistAdmin')) {
				if (hasDAdminAccess !== 'true') {
					defaultResult = false;
				}
			} else {
				if (AppState.get('isTeacher')) {
					if (hasTeacherAccess !== 'true') {
						defaultResult = false;
					}
				}
			}

			if (oneRosterLock === 'true') {
				defaultResult = false;
			}

			return defaultResult;

		}


		function filterListForPerms(list) {
			list.forEach(item => {
				if (item.options) {
					item.options = _.filter(item.options, (titem) => {
						return isPermAllowed(titem);
					});
				}
			});

			// Added filter to remove menu items for which permission check has eliminated options.
			list = _.filter(list, (item) => { return item.options.length > 0; });
			return list;
		}

		function isEnabled(key, product) {
			if (!(key in options)) return;
			return options[key].enabled;
		}

		function getMenuIndex(menu, state) {
			var result = _.findIndex(menu, (item) => { return _.find(item.options, { state: state }); });
			return result;
		}

		return {
			restrict: 'A',
			templateUrl: template,
			scope: {},
			link: function(scope, elem, attrs) {
				scope.isAMSCO = false;
				scope.product = $rootScope.product;
				scope.$on('class change', (e, course) => {
					scope.isAMSCO = course.product === 'amsco';
				});

				scope.$on('$stateChangeSuccess', function(e, state) {
					var name = AppState.getModuleName(state);
					scope.menu = getOptions(name, scope.product);
					scope.visible = isEnabled(name);
					scope.active = state.name;
					scope.mustAddClass = mustAddClass();
					var index = getMenuIndex(scope.menu, scope.active);
					if (index >= 0) scope.menu[index].isOpen = true;
				});

				scope.$on('bootstrap refresh', () => {
					scope.mustAddClass = mustAddClass();
					if (scope.mustAddClass) {
						$state.go('adminApp.addClass');
					}
				});

				scope.handleClick = function(item) {

					if (mustAddClass()) {
						return false;
					}
					if (_.has(item, 'state')) {
						$state.go(item.state);
					} else if (_.has(item, 'href')) {
						window.open(item.href);
					}
				};
			}
		};

	};
