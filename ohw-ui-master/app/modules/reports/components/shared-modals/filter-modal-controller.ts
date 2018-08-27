'use strict';

export default function(dateRanges, sectionList, curFilter, PubSub, $uibModalInstance, $uibModal, $scope) {

	var self = this;

	self.sectionList = _.cloneDeep(sectionList);
	self.sectionList.unshift({id: 'all', name: 'ALL SECTIONS'});
	self.section = curFilter.section || 'all';

	self.rangeList = _.cloneDeep(dateRanges);
	self.rangeList.unshift({id: 'all', name: 'ALL DATES'});
	self.range = curFilter.range || 'all';

	PubSub.subscribe('PrefChange:dateRanges', updateRanges, $scope);
	$scope.$on('modal.closing', closing);

	function updateRanges(ranges) {
		// Update list
		self.rangeList = _.cloneDeep(ranges);
		self.rangeList.unshift({id: 'all', name: 'ALL DATES'});

		// If our current selection was deleted, reset to ALL
		var ids = _.map(self.rangeList, 'id');
		if (_.map(self.rangeList, 'id').indexOf(self.range) === -1)
			self.range = 'all';
	}

	self.manageRanges = function() {
		var modal = $uibModal.open({
			templateUrl: 'options/dateRange.html',
			controller: 'DateRangeCtrl as ctrl'
		});
	};

	// If we're closing due to a dismiss (backdrop click usually)
	// then turn into a regular close, with a proper result.
	function closing($event, reason, isClose) {
		if (!isClose) {
			$event.preventDefault();
			doClose();
		}
	}

	self.done = function() {
		doClose();
	};

	function doClose() {
		$uibModalInstance.close({
			section: self.section,
			range: self.range
		});
	}

};
