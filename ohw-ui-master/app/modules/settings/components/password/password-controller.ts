'use strict';

export default function($rootScope, $scope, User, PubSub) {
	var self = this;

	self.doneSubmit = false;
	self.passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;

	self.resetDone = function()	{
		self.doneSubmit = false;
	};

	self.updatePassword = function() {
		var payload = { old_password: self.pw, new_password: self.newPw };
		User.changePassword(payload).then(
			success,
			error
		);
	};

	function reset() {
		self.pw = '';
		self.newPw = '';
		self.retypePw = '';
		$scope.formPassword.$setPristine();
		$scope.formPassword.$setUntouched();
	}

	function success(info) {
		reset();
		self.doneSubmit = true;
		$rootScope.$broadcast('notification confirmation', { message: 'Password successfully updated.', sticky: false });
	}

	function error(err) {
		reset();
	}

};
