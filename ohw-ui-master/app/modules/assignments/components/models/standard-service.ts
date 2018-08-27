'use strict';

export default function(Assignment) {

	var self = this;

	var standards = [
		{id: 4, shortName: 'CCSS', name: 'AMSCO Algebra I Common Core'},
		{id: 7, shortName: 'CCSS GEO', name: 'AMSCO Geometry Common Core'},
		{id: 8, shortName: 'CCSS A2', name: 'AMSCO Algebra II Common Core'},
//		{id: 2, shortName: 'TEKS', name: 'Texas standards'},
		{id: 10, shortName: 'TEKS CCSS A1', name: 'TEKS Algebra I Common Core'}
//		{id: 11, shortName: 'TEKS CCSS A1', name: 'TEKS Algebra I Lesson'}
	];

	self.data = [];

	function init() {
		_.forEach(standards, function(product){
			Assignment.getHierarchy(product.id).then(
				function (newdata) {
					_.forEach(newdata, function(entry){
						self.data.push(entry);
					});
				});
		});
	}

	function map(code) {
		if (self.data.length < standards.length)
			return ''; // data not loaded yet

		var name = '';
		_.forEach(self.data, function(product){
			if (code.indexOf(product.code) !== -1) {
				_.find(product.children, function(child){
						if (child.code === code) {
							name = child.name;
							return true; // done _.find loop
						}
						return false;
					});

				if (name !== '')
					return false; // early exit forEach loop
			}
			return true;
		});
		return name;
	}

	return {
		init: init,
		map: map
	};

};
