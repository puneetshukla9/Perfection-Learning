'use strict';

import * as Papa from 'papaparse';


export default function($rootScope, TeacherUploadValidation,
		TeacherUploadCSV, State, Auth, User, $scope, $state, $location, License, Config) {

		var self = this;

		self.adminLevel = 'school';

		//right now, all we have is the schoolcsv, and so we will set the template
		//of the district to the school one, this needs to be changed once
		//a district-level csv template is made
		self.template = Config.TEACHER_CSV_FILE_URL;

		var schoolCSV = [
			{ 'First Name': 'Barry', 'Last Name': 'Bates', 'Username': 'bbates@bhs.com' },
			{ 'First Name': 'Alfred', 'Last Name': 'Anderson', 'Username': 'aanderson@bhs.com' }
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
			username: {
				title: '',
				name: 'Username*',
				sampleData: 'jsmith@msd.edu',
				body: 'This is a required field - it must be a valid email address.'
			}
		};

		self.upload = function(file)	{
			file = Papa.parse(file, {
				beforeFirstChunk: function(data) {
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
				'username': headerRow.indexOf('username')
			};

			var len = file.data.length - 1;

			if (file.data[len]) {
				if (file.data[len].length === 1 && file.data[len][0] === '') {
					file.data = file.data.slice(0, len);
				}
			}

			file = _.map(file.data, (row, i) => {
				return [row[headerMap['first name']], row[headerMap['last name']], row[headerMap.username]];
			});

			var plucked = _.map(file, (row) => {
				return row[2];
			});

			var usernames = _.filter(plucked, (entry) => { return entry && entry.length; });
			var hasUsernames = usernames && (usernames.length > 1);

			if (!_.isEqual(headerRow.sort(), ['first name', 'last name', 'username'])) {
				$rootScope.$broadcast('notification error', {
					sticky: true,
					message: 'There is a problem with the header columns in the CSV file you uploaded.' +
					'Please ensure that the fields match the ones given in the instructions.'
				});
				return false;
			} else {
					$state.go('adminApp.teacherUpload.uploadTable', { data: file, changes: { usernames: false } });
			}

		};

	};
