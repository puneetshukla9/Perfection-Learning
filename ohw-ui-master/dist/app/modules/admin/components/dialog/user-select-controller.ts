'use strict';

export default function(State) {

	var self = this;

	self.users = State.get('students');

	self.user = self.users[0];

};
