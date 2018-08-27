describe('sample', function() {
	beforeEach(module('ohw'));

	var $controller;

	beforeEach(inject(function(_$controller_) {
console.log('Controller', $_controller_);
		$controller = _$controller_;
	}));

	describe('problem', function() {
		it('should do something', function() {
			var $scope = {};
			var controller = $controller('ListCtrl', { $scope: $scope });
			expect(1).toBe(1);
		});
	});
});
