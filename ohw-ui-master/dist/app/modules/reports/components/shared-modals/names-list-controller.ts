'use strict';

export default function(model) {

	var self = this;

	self.model = model;

	self.nameList = function(list) {
		var out = [];

		for (var i = 0, len = list.length; i < len; i++)
			out.push(list[i].first + ' ' + list[i].last);

		return out;
	};

};
