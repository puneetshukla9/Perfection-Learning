'use strict';

export default function(Preferences, DateConvert) {

	var self = this;

	self.ranges = Preferences.get('dateRanges');
	fixRanges();

	// These are here to prevent duplication, but really belong in the HTML
	self.pickerOptions = {
		'show-button-bar': false,
		'show-weeks': false
	};

	self.savedIdx = 0;

	self.sortOrder = {type: 'name', dir: 'asc'};

	// Convert dates from strings to date objects
	function fixRanges() {
		_.forEach(self.ranges, function(entry) {
			entry.start = new Date(entry.start);
			entry.end = new Date(entry.end);
		});
	}

	this.addRange = function() {
		clearEdit(true);

		var now = new Date();
		DateConvert.setTime(now, '0:00');

		var later = new Date();
		DateConvert.setTime(later, '23:59');

		self.ranges.push({id: now.getTime(), name: 'New', start: now, end: later, edit: true});

		save();
	};

	this.remove = function($event, idx)
	{
		$event.preventDefault();
		$event.stopPropagation();

		self.ranges.splice(idx, 1);
		clearEdit(true);

		save();
	};

	this.edit = function(entry)
	{
		clearEdit(true);

		entry.edit = true;
	};

	this.startPicker = function($event, idx)
	{
		$event.preventDefault();
		$event.stopPropagation();

		var old = self.ranges[idx].editStart;
		clearEdit();

		self.ranges[idx].editStart = !old;
	};

	this.endPicker = function($event, idx)
	{
		$event.preventDefault();
		$event.stopPropagation();

		var old = self.ranges[idx].editEnd;
		clearEdit();

		self.ranges[idx].editEnd = !old;
	};

	function clearEdit(stopEdit) {
		for (var i = 0, len = self.ranges.length; i < len; i++) {
			self.ranges[i].editStart = false;
			self.ranges[i].editEnd = false;

			if (stopEdit)
				self.ranges[i].edit = false;
		}
	}

	function getOptions(mode, idx) {
		var out = _.clone(self.pickerOptions);

		if (mode === 'end')
			out['min-date'] = self.ranges[idx].start;

		return out;
	}

	this.sort = function(field)
	{
		clearEdit(true);

		if (self.sortOrder.type === field) {
			self.sortOrder.dir = (self.sortOrder.dir === 'asc' ? 'dsc' : 'asc');
		} else {
			self.sortOrder.type = field;
		}
		doSort();
	};

	function doSort() {
		self.ranges = _.sortByOrder(self.ranges, self.sortOrder.type, self.sortOrder.dir);
	}

	// Flags any invalid entries
	this.validate = function(entry)
	{
		entry.invalid = false;

		if (!entry.name) {
			entry.invalid = true;
		} else if (!entry.start || entry.start === 'Invalid Date') {
			entry.invalid = true;
		} else if (!entry.end || entry.end === 'Invalid Date') {
			entry.invalid = true;
		} else if (entry.start > entry.end) {
			entry.invalid = true;
		}
		save();
	};

	// Saves changes
	function save() {
		var data = [];

		_.forEach(self.ranges, function(entry) {
			if (!entry.invalid)
				data.push({				// Create a new object since we're storing metadata directly in the pref
					id: entry.id || Date.now(),
					name: entry.name,
					start: entry.start,
					end: entry.end
				});
		});

		Preferences.set('dateRanges', data);
	}

};
