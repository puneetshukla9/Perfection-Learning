'use strict';

export default function($scope, $rootScope, User, PubSub) {
	var self = this;

	self.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

	self.updateEmail = function() {
		var payload = { email: self.newEmail, password: self.pw };
		User.changeEmail(payload).then(() => {
			$rootScope.$broadcast('notification confirmation', { message: 'Email successfully updated.', sticky: false });
			self.reset();
		}, () => {
			$rootScope.$broadcast('notification error', { message: 'Sorry, but we had a problem updating your email.', sticky: false });
			self.pw = '';
			$scope.formEmail.$setPristine();
			$scope.formEmail.$setUntouched();
		});
	};

	self.reset = function() {
		self.newEmail = '';
		self.pw = '';
		self.retypeEmail = '';
		$scope.formEmail.$setPristine();
		$scope.formEmail.$setUntouched();
	};

};
