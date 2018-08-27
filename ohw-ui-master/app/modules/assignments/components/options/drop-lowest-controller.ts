'use strict';

export default function(Preferences, $uibModalInstance, PubSub) {

	var self = this;

	self.drop = Preferences.get('dropLowest') || {};

	self.fieldList = [
		{name: 'Homework', model: 'hw'},
		{name: 'Quizzes', model: 'quiz'},
		{name: 'Tests', model: 'test'},
		{name: 'i-Practice', model: 'ip'}
	];


	// Flags any invalid entries

	this.validate = function() {
		var val = +self.drop.count;
		if (!isNaN(val) && val >= 0 && val < 100)
			save();
	};


	// Saves changes

	function save() {
		Preferences.set('dropLowest', self.drop);
	}



	this.close = function() {
		$uibModalInstance.close({});
		PubSub.publish('gradeWeightDone');
	};

};
