'use strict';

var eyeIcon = require('./../../assets/icons/eye-icon.svg');

export default function(Preferences, PubSub, $scope) {

	var self = this;
	self.image = eyeIcon;
	self.list = Preferences.buildMenu(self.items);
	$scope.$watch('items', function (items) {
		self.list = Preferences.buildMenu(items);
	}.bind(this));

	// render default state

	self.toggle = function(item) {
		var index = _.findIndex(self.list, { preference: item.preference });
		self.list[index].state = !self.list[index].state;
		Preferences.set(item.preference, self.list[index].state);
	};

};
