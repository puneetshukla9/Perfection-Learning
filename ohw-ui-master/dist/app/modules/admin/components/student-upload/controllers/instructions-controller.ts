'use strict';

import * as Papa from 'papaparse';


export default function($rootScope, StudentUploadValidation,
		StudentUploadCSV, State, Auth, User, $scope, $state, $location, License, Config) {

		var self = this;

		self.adminLevel = 'school';

		//right now, all we have is the schoolcsv, and so we will set the template
		//of the district to the school one, this needs to be changed once
		//a district-level csv template is made
		self.template = Config.CSV_FILE_URL;

		var schoolCSV = [
			{ 'First Name': 'Barry', 'Last Name': 'Bates', 'Student ID': '1002', 'Username': 'bbates@bhs.com' },
			{ 'First Name': 'Alfred', 'Last Name': 'Anderson', 'Student ID': '1023', 'Username': 'aanderson@bhs.com' }
		];

		self.buildTemplate = function(template) {
		  template = Papa.unparse(template);
			if (template) {
				var blob = new Blob([template], { type: 'text/csv' });
				return window.URL.createObjectURL(blob);
			} else {
				return false;
			}
		};

		self.init = function() {
			Auth.get().then(function(res) {

				if (res.data.type !== 'school admin') {
					self.adminLevel = 'district'; // district admin
				}

				State.set('adminLevel', self.adminLevel); //'school'; // or 'district'

			});
		};

		self.init();

		self.popover = {
			firstName: {
				title: '',
				name: 'First Name*',
				sampleData: 'Julie',
				body: 'This is a required field. For first and last names, the characters @, !, and ? are not allowed.'
			},
			lastName: {
				title: '',
				name: 'Last Name*',
				sampleData: 'Smith',
				body: 'This is a required field. For first and last names, the characters @, !, and ? are not allowed.'
			},
			studentId: {
				title: '',
				name: 'Student ID*',
				sampleData: '9078123',
				body: 'This is a required field. If you do not know student IDs, contact your school or district administration.'
			},
			username: {
				title: '',
				name: 'Username',
				sampleData: '',
				body: 'We suggest leaving the username column blank. We will create usernames for you.'
			}
		};

		self.upload = function(file)	{
			file = Papa.parse(file, {
				beforeFirstChunk: function(data) {
					// var tmp = data.replace(/[\x0a\x0d]/g, '');
					// var nonPrintable = /[\x00-\x1f]/.test(tmp);
					// if (nonPrintable)
					// 	console.log('File rejected for non-printable characters');
					// return nonPrintable ? false : data;
					return data;
				}
			});

			var headerRow = file.data[0];

			headerRow = headerRow.map(function(record) {
				return record.toLowerCase();
			});

			file.data[0] = headerRow;

			var headerMap = {
				'first name': headerRow.indexOf('first name'),
				'last name': headerRow.indexOf('last name'),
				'student id': headerRow.indexOf('student id'),
				'username': headerRow.indexOf('username')
			};

			var len = file.data.length - 1;

			if (file.data[len]) {
				if (file.data[len].length === 1 && file.data[len][0] === '') {
					file.data = file.data.slice(0, len);
				}
			}

			file = _.map(file.data, (row, i) => {
				return [row[headerMap['first name']], row[headerMap['last name']], row[headerMap['student id']], row[headerMap.username]];
			});

			var plucked = _.map(file, (row) => {
				return row[3];
			});

			var usernames = _.filter(plucked, (entry) => { return entry && entry.length; });
			var hasUsernames = usernames && (usernames.length > 1);

			if (!_.isEqual(headerRow.sort(), ['first name', 'last name', 'student id', 'username'])) {
				$rootScope.$broadcast('notification error', {
					sticky: true,
					message: 'There is a problem with the header columns in the CSV file you uploaded.' +
					'Please ensure that the fields match the ones given in the instructions.'
				});
				return false;
			} else {
				// if (hasUsernames) {
				// 	$state.go('adminApp.studentUpload.uploadConfirm', { data: file });
				// } else {
					$state.go('adminApp.studentUpload.uploadTable', { data: file, changes: { usernames: false } });
				// }
			}

		};

	};
