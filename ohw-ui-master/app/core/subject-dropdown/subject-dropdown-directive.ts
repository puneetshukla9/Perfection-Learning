'use strict';

import * as $ from 'jquery';

export default function(AppState, State, $state, $timeout, $rootScope, subjectDropdownService) {
		var templateUrl = require('./subject-dropdown.html');

		// Hide dropdown for certain states.
		var elementHideStates = ['libraryApp.bookshelf.userBookshelf'];
		function conditionallySetHideFlag(scope) {
			var hideProductName = false;
			elementHideStates.forEach(st => {
				var re = new RegExp('^' + st);
				if (re.test($state.current.name)) {
					hideProductName = true;
				}
			});
			scope.hideProductName = hideProductName;

		}

		// Intended to set position of dropdown, based on position of selected subject name.
		function positionDropdown() {
			// Delay getting the coordinates, to make sure subject name is in place.
			$timeout(() => {
				var el = document.getElementsByClassName('subject-dropdown')[0];
				//var left = parseInt($('.subject-dropdown>span').offset().left, 10) - 15; // Arbitrary adjustment to position dropdown.
				var left = 0;
				$('.subject-dropdown-wrap').css({ left: left + 'px' });
			}, 500);
		}

		function filterCourses(productName) {
			var courses = subjectDropdownService.getCourseSubset(productName);
			var filter = courses.map((item) => item.id);
			AppState.setCourseFilter(filter);
			State.setFilter('classes', 'course_id', filter);
			// Added to trigger using filtered courses for Assignment List course dropdown.
			$rootScope.$broadcast('filtered courses');
		}

		function setDefaultProduct(scope) {
			var product = {
				name: '',
				nameDisplay: ''
			};
			if (scope.hasMultipleSubjects()) {
				let tmp = scope.products.filter((item) => item.selected);
				if (tmp.length) {
					product.name = tmp[0].name;
					product.nameDisplay = tmp[0].nameDisplay;
//					product.state = tmp[0].state;
				} else if (scope.products.length > 0) {
					product.name = scope.products[0].name;
					product.nameDisplay = scope.products[0].nameDisplay;
//					product.state = scope.subjects[0].state;
				}
			} else if (scope.products.length > 0) {
				product.name = scope.products[0].name;
				product.nameDisplay = scope.products[0].nameDisplay;
//				product.state = scope.subjects[0].state;
			}
			return product;
		}

		// Use ASSIGNMENT_GENERATOR as a constant for the assignGenApp module name.
		// The allowProductSelection function is meant to enable or disable the product dropdown
		// menu, depending on some condition. The function was added specifically to allow the
		// menu to be disabled in the assignment generator unless an assignment was being created
		// and hadn't yet been named.
		const ASSIGNMENT_GENERATOR = 'assignGenApp';
		function allowProductSelection() {
			var result = true;
			var mod = AppState.getModuleName($state.current);
			if (mod === ASSIGNMENT_GENERATOR && !!$state.params.id) {
				result = false;
			}
			return result;
		}

		return {
      restrict: 'A',
      scope: true,
			templateUrl: templateUrl,
			replace: true,
			link: function(scope, elem, attrs) {
				// Conditionally hide product name.
				conditionallySetHideFlag(scope);
				var _allowProductSelection = allowProductSelection();

				function setProductDropdown(pObj) {
					scope.product = {
						name: pObj.name,
						nameDisplay: pObj.nameDisplay
					};
					positionDropdown();
					subjectDropdownService.saveProductSelection(pObj.name);
					filterCourses(pObj.name);
					$state.go($state.current, {}, { reload: true });

				}

				// Check for multiple subjects/products in list. Behavior and appearance differ if there's only one vs multiple.
				scope.hasMultipleSubjects = function() {
					return scope.products.length > 1	;
				};

				// returns flag for whether or not to show dropdown arrow. Currently, the arrow should show if:
				// * the user has multiple products to choose from, and
				// * the user is in a module and state that allows product selection.
				scope.showDropdownArrow = function() {
					return (scope.hasMultipleSubjects() && _allowProductSelection);
				};

				// Handler for displaying list of products on click of current product or down arrow.
        scope.showSubjectDropdown = function(evt) {
					if (_allowProductSelection) {
						subjectDropdownService.toggleProductDropdown(evt);
						var left = parseInt($('.subject-dropdown-wrap').offset().left, 10);
					}
        };

				// Handler for selecting clicked product in dropdown.
				scope.selectSubject = function(evt) {
					var data = evt.target;
					if (!data.dataset.name) data = data.parentNode;
					subjectDropdownService.toggleProductDropdown(evt);
					scope.product = {
						name: data.dataset.name,
						nameDisplay: data.dataset.nameDisplay
					};
					positionDropdown();
					subjectDropdownService.saveProductSelection(data.dataset.name);
					filterCourses(data.dataset.name);
					$state.go($state.current, {}, { reload: true });
				};

				scope.$on('update product', function(e, data) {
					var toProductId = '' + data.productId;
					var setToProductResults = scope.products.filter((s) => { return s.productId === toProductId; });
					if (setToProductResults.length === 0) {
						scope.products = subjectDropdownService.getStarted();
						setToProductResults = scope.products.filter((s) => { return s.productId === toProductId; });
					}
					var setToProduct = setToProductResults[0];
					if (setToProduct) {
						setProductDropdown(setToProduct);
					}

				});

				scope.$on('bootstrap refresh', function() {
					// Update the products list when there's new bootstrap data.
					// However, do not set the default product.
					scope.products = subjectDropdownService.getStarted();
					filterCourses(scope.product.name);
				});

				scope.products = subjectDropdownService.getStarted();
				scope.product = setDefaultProduct(scope);
				filterCourses(scope.product.name);

				// Use $stateChange detection to maintain _allowProductSelection flag.
				scope.$on('$stateChangeSuccess', (e, state) => {
						positionDropdown();
						conditionallySetHideFlag(scope);
						_allowProductSelection = allowProductSelection();
				});

				positionDropdown();

			}
		};

	};
