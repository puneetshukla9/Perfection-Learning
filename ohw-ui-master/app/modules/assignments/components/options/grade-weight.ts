'use strict';

export default function(Preferences, $uibModalInstance, PubSub) {

	var self = this;

	self.weights = Preferences.get('gradeWeights') || {};

	self.weightList = [
		{name: 'Homework', model: 'hw'},
		{name: 'Quizzes', model: 'quiz'},
		{name: 'Tests', model: 'test'},
		{name: 'i-Practice', model: 'ip'}
	];



	this.checkSum = function()
	{
		var sum = 0;

		_.forEach(self.weightList, function(entry) {
			var val = +self.weights[entry.model];

			if (!isNaN(val) && val >= 0)
				sum += val;
		});

		return round(sum, 10);	// Correct for the JavaScript rounding error
	};



	function round(rnum, rlength) {
		return Math.round(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength);
	}


	// Flags any invalid entries

	this.validate = function(entry) {
		if (self.checkSum() === 100)
			save();
	};


	// Saves changes

	function save() {
		Preferences.set('gradeWeights', self.weights);
	}



	this.close = function() {
		$uibModalInstance.close({});
		PubSub.publish('gradeWeightDone');
	};

};
