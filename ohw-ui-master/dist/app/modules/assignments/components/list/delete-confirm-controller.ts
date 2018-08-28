'use strict';

export default function(assign, $uibModalInstance) {
	var self = this;

	self.assign = assign;
	self.action = 'Delete';
	if (assign.isTemplate) {
		self.action = 'Reset';
	}
};
