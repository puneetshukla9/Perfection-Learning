'use strict';

export default function(students, assignment) {

	var self = this;

	self.students = students;
	self.assignment = assignment;

	self.selections = {};



	this.toggle = function(student) {
		var idx = self.selections.indexOf(student.id);
		if (idx !== -1) {
			self.selections.splice(idx, 1);
		} else {
			self.selections.push(student.id);
		}
	};



	this.count = function() {
		var cnt = 0;

		_.forEach(self.selections, function(entry) {
			if (entry)
				cnt++;
		});

		return cnt;
	};



	this.getResults = function()
	{
		var out = [];

		_.forEach(self.selections, function(entry, id) {
			if (entry)
				out.push(id);
		});

		return out;
	};

};
