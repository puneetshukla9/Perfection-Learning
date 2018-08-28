'use strict';

export default function($rootScope, $scope, $location, $timeout, AppState, PubSub) {

	var self = this;
	var isPLCAdmin = AppState.get('isPLCAdmin');
	var event = isPLCAdmin ? 'plcSearch:userSearch' : 'filterTable:newTerm';
	var searchDelayMs = 1500;
	var searchDelay;

	var searchObj = AppState.get('plcsearch') || { term: '' };
	self.filterValue = searchObj.term;

	self.searchFilterChanged = function() {
		self.publishSearchTerm();
	};

	self.performSearch = function () {
		self.publishSearchTerm();
	};

	self.publishSearchTerm = function () {
		if (isPLCAdmin) {
			if (searchDelay) $timeout.cancel(searchDelay);
			searchDelay = $timeout(publish, searchDelayMs);
		} else {
			publish();
		}
	};

	function publish() {
		PubSub.publish(event, {
			term: self.filterValue
		});
	}

};
