'use strict';

import * as Papa from 'papaparse';

export default function($filter, $sce, $q, Auth, $templateRequest, $rootScope,
		TableDefaults, $timeout, $compile, TeacherUploadCSV, $state, TeacherUploadValidation,
		TeacherUploadGenerator, AppState, State, TeacherHelper, School, User, $scope) {

		var schools = State.get('schools');

		$scope.initialized = false;

		var headerCellTemplate = require('./../templates/grid/upload-grid-header-cell.html');
		var editableCellTemplate = require('./../templates/grid/upload-editable-cell.html');
		var cellTemplate = require('./../templates/grid/upload-cell.html');
		var validCellTemplate = require('./../templates/grid/upload-cell-valid.html');

		$scope.filter = 'all';
		$scope.success = false;
		$scope.validRows = 0;
		$scope.OKToSubmit = true;
		$scope.isPLCAdmin = AppState.get('isPLCAdmin');
		console.log('table-controller isPLCAdmin', $scope.isPLCAdmin);
		$scope.isDistAdmin = AppState.get('isDistAdmin');

		var self = this;
		var file = $state.params.data;
		var teachers = TeacherUploadCSV.convertToGridObject(file);

		if (teachers) file = null;

		var schoolId = null;
		_.each(teachers, function(teacher, i) {
			teachers[i].index = i;
		});

		function initSchools() {
			$scope.schools = State.get('schools')
				.filter((obj) => { return !obj.treat_as_district; })
				.map((obj) => { return { id: obj.school_id, name: obj.name }; });
			//			$scope.isDistAdmin = res.data.type === 'district admin';
			$scope.mustSelectSchool = !$scope.isPLCAdmin && $scope.isDistAdmin && $scope.schools.length > 1;
			if ($scope.mustSelectSchool) {
				$scope.OKToSubmit = false;
			}
		}

		var reindexData = (data) => {
			return _.map(data, (obj, i) => {
				var result = _.omit(obj, '$$hashKey');
				result.valid = false;
				result.index = i;
				return result;
			});
		};

		Auth.get().then(function(res) {
			schoolId = res.data.school_id;
			if (schools) {
				initSchools();
			} else {
				Schools.all(AppState).then(() => {
					initSchools();
				});
			}
		});

		// refreshes and revalidates the entire grid
		$scope.refreshGrid = function(data) {
			$scope.GridValidator.all(data).then((count) => {
				$scope.validRows = $scope.GridValidator.count(data);
			});
		};

		var config = {
			'first name': {
				type: 'name',
				errors: 'Erase characters like !, @ and # from names.',
				canResolveEmpty: false,
				validator: TeacherUploadValidation.validators.name.check,
				resolver: TeacherUploadValidation.validators.name.resolve
			},
			'last name': {
				type: 'name',
				errors: 'Erase characters like !, @ and # from names.',
				canResolveEmpty: false,
				validator: TeacherUploadValidation.validators.name.check,
				resolver: TeacherUploadValidation.validators.name.resolve
			},
			'username': {
				type: 'username',
				canResolveEmpty: false,
				errors:
					'Check to ensure the e-mail address you entered is valid.',
				validator: TeacherUploadValidation.validators.username.check,
				overwrite: $state.params && $state.params.changes && $state.params.changes.usernames,
				resolver: TeacherUploadValidation.validators.username.resolve
			}
		};

		var tooltip = '';

		$scope.GridValidator = new TeacherUploadValidation.GridValidator();

		var afterCellEdit = function(row, col, n, o) {
			row[col.name] = n;
			$scope.GridValidator.all($scope.gridOptions.data).then(() => {
				$scope.GridValidator.row(row, $scope.gridOptions.data).then((count) => {
					$scope.validRows = count;
				});
			});
		};

		$scope.gridOptions = {
			onRegisterApi: function(gridApi) {
				$scope.gridApi = gridApi;
				$scope.gridApi.grid.registerRowsProcessor($scope.validFilter, 900);
				$scope.gridApi.edit.on.afterCellEdit($scope, afterCellEdit);
				$scope.gridApi.core.on.rowsRendered($scope, function() {
					TableDefaults.checkVerticalScroll($scope.gridApi, $scope.gridOptions, $scope.gridApi.grid.gridHeight);
					TableDefaults.checkPagination($scope.gridApi, $scope.gridOptions);
				});
			},
			rowHeight: 40,
			enableColumnMenus: false,
			enableHorizontalScrollbar: 0,
			paginationPageSizes: [12, 25, 50, 75],
			paginationPageSize: 25,
			data: teachers,
			columnDefs: [
				{ field: 'valid', displayName: '', visible: true, cellTemplate: validCellTemplate,
					cellEditableCondition: false, width: '60' }, // internal only
				{ displayName: 'First Name*', field: 'first name', cellTemplate: cellTemplate,
					editableCellTemplate: editableCellTemplate, headerCellTemplate: headerCellTemplate },
				{ displayName: 'Last Name*',  field: 'last name', cellTemplate: cellTemplate,
					editableCellTemplate: editableCellTemplate, headerCellTemplate: headerCellTemplate },
				{ displayName: 'Username*',   field: 'username', cellTemplate: cellTemplate,
					editableCellTemplate: editableCellTemplate, headerCellTemplate: headerCellTemplate },
				{ field: 'index', visible: false }  // internal only - $$hashKey unreliable
			]
		};

		$scope.refreshGrid($scope.gridOptions.data);

		$scope.validFilter = function(renderableRows) {
			renderableRows.forEach(function(row) {
				if ($scope.filter === 'all') {
					row.visible = true;
				} else {
					var valid = false;
					if (_.has(row.entity, 'valid') && row.entity.valid === true) {
						valid = true;
					}
					if (valid && $scope.filter === 'correct') {
						row.visible = true;
					} else if (!valid && $scope.filter === 'incorrect') {
						row.visible = true;
					} else {
						row.visible = false;
					}
				}
	    	});
				var hasCorrect = renderableRows.filter((item) => { return item.visible && item.entity.valid; }).length;
				var hasIncorrect = renderableRows.filter((item) => {
					return item.visible && !item.entity.valid;
				}).length;
				$scope.validRows = hasCorrect;
				$scope.hasIncorrect = hasIncorrect;
	    	return renderableRows;
		};

		$scope.verifySchool = function() {
			$scope.OKToSubmit = false;
			if ($scope.schoolFilter) {
				$scope.OKToSubmit = $scope.validRows > 0;
				schoolId = parseInt($scope.schoolFilter.id, 10);
				console.log('selected school', $scope.schoolFilter);
			}
		};

		$scope.applyFilter = function() {
			$scope.gridApi.grid.refresh();
			$scope.gridOptions.paginationCurrentPage = 1;
		};

		$scope.getPopover = (row, col) => {
			var res = $scope.GridValidator.getMatrix(row.index, col.name);
			var name = col.colDef.field;
			var popover = {};
			switch (res.error) {
				case 'required':
					popover.body = 'This field is required.';
					break;
				case 'invalid':
					popover.body = config[name].errors;
					break;
				case 'duplicate':
					var plural = res.users.length > 1;
					var hasHave = plural ? 'have' : 'has';
					var dupeString = res.users.join(', ') + ' also ' + hasHave + ' the same ' + name + '.';
					popover.body = 'There are duplicates in this column. ' + dupeString;
					break;
				case 'taken':
					popover.body = 'That ' + name + ' has already been taken.';
					break;
				default:
					break;
			}
			return $sce.trustAsHtml(popover.body);
		};

		$scope.isValid = (row, col) => {
			var result = $scope.GridValidator.getMatrix(row.index, col.name);
			if (result.result) {
				return true;
			} else {
				return false;
			}
		};

		$scope.canResolve = (row, col) => {
			// var name = col.name;
			// var valuePresent = row[name] && _.has(row[name], 'length');
			var result = $scope.GridValidator.getMatrix(row.index, col.name);
			if (!result.result) {
				if (result.error === 'required') {
					return config[col.field].canResolveEmpty;
				} else {
					return true;
				}
			}
			return result;
		};

		$scope.resolve = (row, col) => {
			var name = col.colDef.field;
			var value = row[name];
			var result = config[name].resolver(name, value, row);
			var index = _.findIndex($scope.gridOptions.data, { index: row.index });
			$scope.gridOptions.data[index][name] = result;
			// revalidate row
			$scope.GridValidator.row(row, $scope.gridOptions.data).then((count) => {
				$scope.validRows = count;
			});
			return result;
		};

		var buildUser = function(row) {
			if (!schoolId) return;
			return {
				first: row['first name'],
				last: row['last name'],
				email: row.username,
				password: TeacherHelper.genPwd(), //row.password,
				usertype: 2, // 2 is teacher
				school_id: parseInt(schoolId, 10), // ID needs to be converted to integer
				verbose: true
			};
		};

		$scope.submit = function() {
			var userData = [];
			var submittedIndices = [];
			var userEmailList = [];
			if ($scope.dropdown_school_id) {
				schoolId = $scope.dropdown_school_id;
			}

			_.each($scope.gridOptions.data, function(row) {
				if (row.valid) {
					userData.push(buildUser(row));
					submittedIndices.push(row.index);
					userEmailList.push(row.username);
				}
			});

			$scope.saving = true;
			console.log('User.create', userData);
			var regCode = $scope.getRegCodeForSchoolById(schoolId);

			User.create(userData).then(function(res) {

				if (_.has(res, 'failure') && res.failure.length) {
					var badUsers = [];
					_.each(res.failure, function(obj) {
						for (var key in obj) {
							var index = _.findIndex($scope.gridOptions.data, { username: key });
							if (index >= 0) badUsers.push(index);
						}
					});

					//remove bad users from userEmailList
					_.each($scope.gridOptions.data, function(row) {
						if (_.indexOf(badUsers, row.index) > -1) {
							_.remove(userEmailList, function(value) {
								return value === row.email;
							});
						}
					});

					$scope.gridOptions.data =
						_.filter($scope.gridOptions.data, function(row, i) {
							return badUsers.indexOf(row.index);
						});

					$scope.registerUsers(regCode, userData).then(
						function (response) {
							if (userEmailList.length > 0) {
								$scope.sendResetPasswords(userEmailList).then(
									function (response) {
										$scope.saving = false;
										$scope.validRows = 0;
										$rootScope.$broadcast('notification error', { message: 'One or more of the teachers you submitted could not be sent a password reset.' });
									},
									function (error) {
										$scope.saving = false;
										$scope.validRows = 0;
										$rootScope.$broadcast('notification error', { message: 'One or more of the teachers you submitted could not be created.' });
									}
								);
							}
						},
						function (error) {
							$scope.saving = false;
							$scope.validRows = 0;
							$rootScope.$broadcast('notification error', { message: 'One or more of the teachers you submitted could not be registered.' });
						}
					);

				} else {
					$scope.registerUsers(regCode, userData).then(
						function (response) {
							$scope.sendResetPasswords(userEmailList).then(
								function (response) {
									var newData = _.reject($scope.gridOptions.data, (row, i) => { return submittedIndices.indexOf(row.index) >= 0; });
									$scope.gridOptions.data = [];
									// the hash keys get all fudged up on reload
									// rebuild the index
									$scope.gridOptions.data = reindexData(newData);
									$scope.refreshGrid($scope.gridOptions.data);
									$scope.saving = false;
									$scope.validRows = 0;
									var message = 'Teachers successfully added!';
									var messageLine2 = 'All teachers have been sent an email to set their password.';
									$rootScope.$broadcast('notification confirmation', { message: message, messageLine2: messageLine2 });
								},
								function (error) {
									var newData = _.reject($scope.gridOptions.data, (row, i) => { return submittedIndices.indexOf(row.index) >= 0; });
									$scope.gridOptions.data = [];
									// the hash keys get all fudged up on reload
									// rebuild the index
									$scope.gridOptions.data = reindexData(newData);
									$scope.refreshGrid($scope.gridOptions.data);
									$scope.saving = false;
									$scope.validRows = 0;
									$rootScope.$broadcast('notification confirmation', { message: 'Teachers successfully added!' });
								}
							);
						},
						function (error) {
							$scope.saving = false;
							$scope.validRows = 0;
							$rootScope.$broadcast('notification error', { message: 'One or more of the teachers you submitted could not be registered.' });
						}

					);
				}
			});
		};

		$scope.registerUsers = function(regCode, userList) {
			var promiseArray = [];

			_.each(userList, function(thisUser) {
				var thisPayload = {
					first: thisUser.first,
					last: thisUser.last,
					email: thisUser.email,
					password: thisUser.password,
					pw: thisUser.password,
					school_id: thisUser.school_id,
					token: regCode
				};
				promiseArray.push(User.registerWithCode(thisPayload));
			});

			//return promise to make sure next tasks wait on it
			return $q.all(promiseArray);

		};

		$scope.getRegCodeForSchoolById = function(school_id) {
			var thisSchool = _.find(schools, (v) => {
				return parseInt(v.school_id, 10) === school_id;
			});

			if (thisSchool) {
				return thisSchool.registration_code;
			}

		};

		$scope.sendResetPasswords = function(emailList) {
			//create an array of teachers to submit to password email
			var promiseArray = [];
			_.each(emailList, function(thisEmail) {
				promiseArray.push(User.sendPwEmail(thisEmail));
			});

			//return promise to make sure next tasks wait on it
			return $q.all(promiseArray);
		};

		$scope.getUserByRowIndex = function(rows, indexToPluck) {
			return _.find(rows, {'index': indexToPluck});
		};

		$scope.generateExportCSV = function(data) {
			var exportResults = _.filter(data, function(row, i) {
				return !row.valid;
			});
			var csv = Papa.unparse(exportResults);
			if (csv) {
				var blob = new Blob([csv], { type: 'text/csv' });
				return window.URL.createObjectURL(blob);
			}
		};

		$scope.export = function() {
			$scope.filter = 'incorrect';
			$scope.applyFilter();
			var BLACKLIST = ['$$hashKey', 'valid', 'index'];
			var data = _.filter($scope.gridOptions.data, function(o) {
				return !o.valid;
			});
			data = _.map(data, function(o) {
				return _.omit(o, BLACKLIST);
			});
			$scope.invalidEntries = $scope.generateExportCSV(data);
			$timeout(function() {
				document.querySelector('a.export-invalid-download-link').click();
			});
		};

		$scope.$on('grid correct count', function() {
			_.each($scope.gridOptions.data, function(row) {
				TeacherUploadValidation.grid.row(row, $scope.gridOptions.data).then(function(data) {
					$scope.validRows = TeacherUploadValidation.grid.count($scope.gridOptions.data);
				});
			});
		});

	};
