'use strict';

import 'ng-tags-input';

export default function(assign, courselist, $uibModalInstance, $scope) {
	var self = this;

	self.assign = assign;

	self.pickedCourses = [];

	$scope.getCourseList = function(query) {
		query = query.toLowerCase();
		var filteredList = self.courselist.filter(function(item) { return item.text.toLowerCase().indexOf(query) !== -1; });
		return filteredList;
	};

	self.action = 'Import';

	self.courselist = courselist;

};
