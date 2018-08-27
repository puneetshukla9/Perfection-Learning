'use strict';

export default function($q, Config, User) {

	var Validation = {};

	class Validator {

		constructor(key, config) {
			this.key = key;
			this.config = config;
			this.check = this.check.bind(this);
			this.resolve = this.resolve.bind(this);
		}

		check(value, makeExternalCalls = true) {
			var self = this;
			return function(grid) { // grid is needed to check for dupes
				var deferred = $q.defer();
				var regexPass = false;
				if (!value && self.config.required) {
					deferred.resolve({ result: false, error: 'required' });
				}
				if (self.config.regex && self.config.regex.length) {
					_.each(self.config.regex, (regex, i) => {
						regex.lastIndex = 0;
						if (regex.test(value)) {
							regexPass = true;
							return false; // one regex passed, all that's required so break
						}
					});
					if (!regexPass) deferred.resolve({ result: false, error: 'invalid' });
				}
				if (self.config.duplicates) {
					if (!grid) throw new Error('grid required for testing against dupes.');
					var dupes = self.checkDuplicates(grid, value);
					if (dupes) deferred.resolve(dupes);
				}
				if (self.config.routine && makeExternalCalls) {
					self.config.routine.call(self, value).then((res) => {
						console.log('routine returned with: ', res);
						deferred.resolve(res);
					});
				} else {
					deferred.resolve({ result: true });
				}
				return deferred.promise;
			};
		}

		checkDuplicates(data, value) {
			var	query = {},
				response = {},
				indices = [],
				users = [];

			query[this.key] = value;
			var results = _.filter(data, query);

			if (!results.length) return false;

			response.indices = _.map(results, 'index');
			response.users = _.map(results, (row) => { return row['first name'] + ' ' + row['last name']; });

			if (response.indices && response.indices.length <= 1) return false; // 'true'

			response.result = false;
			response.error = 'duplicate';
			return response;
		}

		resolve(type, value, row) {
			if (!_.has(value, 'length') || !value.length) return value;
			var result = value;
			if (_.has(this.config, 'replace')) {
				var regex = this.config.replace;
				result = result.replace(regex, '');
			}
			if (this.config.diacritics) {
				_.each(Config.diacriticsMap, function(diacritic, i) {
					result = result.replace(diacritic, i);
				});
			}
			return result;
		}
	}

	var checkUsername = function(value) {
		var deferred = $q.defer();
		User.areEmailsTaken([value]).then(function(data) {
			var response = { result: true };
			if (_.has(data, 'length') && data.length) {
				if (data.indexOf(value) >= 0) {
					response = { result: false, error: 'taken' };
				}
			}
			console.log('returning uname response: ', response);
			deferred.resolve(response);
			return response;
		});
		return deferred.promise;
	};


	var validators = {};
	validators.name =
		new Validator('name', { required: true, routine: false, duplicates: false,
			regex: [Config.validation.name.regex], replace: Config.validation.name.replace, diacritics: true });
	validators.username =
		new Validator('username', { required: true, routine: checkUsername, duplicates: true,
			regex: [Config.validation.email.regex/*, Config.validation.username.regex*/] });

	validators['first name'] = validators.name;
	validators['last name'] = validators.name;


	class GridValidator {

		constructor() {
			this.matrix = [];	// keep track of initial state of validation
		}

		getMatrix(row, col) {
			if (row >= 0 && col) {
				return this.matrix[row][col];
			} else {
				return this.matrix;
			}
		}

		saveMatrix(index, res) {
			this.matrix[index] = {
				'first name' : res[0],
				'last name' : res[1],
				'username' : res[2]
			};
		}

		all(data) {
			var self = this,
				result = 0,
				deferred = $q.defer(),
				promiseArr = [];

			var BLACKLIST = ['$$hashKey', 'val id', 'index'];
			var usernames = _.map(data, 'username');


			var bulkValidation = [
			  User.areEmailsTaken(usernames)
			];

			_.each(data, function(row, i) {
			  promiseArr.push(self.row(row, data, false));
			});

			$q.all(promiseArr).then(function(res) {
				$q.all(bulkValidation).then(function(res) {
					var usersTaken = res[0];
					// find indices of users who have been taken
					_.each(usersTaken, function(user, i) {
						var index = _.findIndex(data, { 'username' : user });
						if (index !== -1 && user !== '') {
							data[index].valid = false;
							self.matrix[index].username = { result: false, error: 'taken' };
						}
					});
					deferred.resolve(self.count(data));
				});
			});

			return deferred.promise;

		}

		row(row, data, makeExternalCalls = true) {
			var	self = this,
				deferred = $q.defer(),
				promiseArr = [],
				index = _.findIndex(data, { index: row.index }),
				blacklist = blacklist || ['index', '$$hashKey', 'valid'];
			for (var key in row) {
				if (blacklist.indexOf(key) >= 0) continue;
				promiseArr.push(validators[key].check(row[key], makeExternalCalls)(data));
			}

			$q.all(promiseArr).then(function(res) {
				self.saveMatrix(index, res);
				var validEntries = _.filter(res, { result: true });
				if (validEntries.length === res.length) {
					data[index].valid = true;
				} else {
					data[index].valid = false;
				}
				var count = self.count(data);
				deferred.resolve(count);
			});

			return deferred.promise;
		}

		column() {

		}

		count(data) {
			var result = _.filter(data, { valid: true });
			if (_.has(result, 'length')) {
				return result.length;
			} else {
				return 0;
			}
		}

	}

	Validation.validators = validators;
	Validation.GridValidator = GridValidator;

	return Validation;

  };
