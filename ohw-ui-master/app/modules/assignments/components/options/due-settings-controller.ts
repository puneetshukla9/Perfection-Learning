'use strict';

export default function(assigned, due, leadTime) {

	var self = this;

	self.defaultAssign = new Date(assigned);
	self.defaultDue = new Date(due);

	self.leadTime = leadTime;

};
