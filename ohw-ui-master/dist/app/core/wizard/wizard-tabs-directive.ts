'use strict';

// not possible to require the wizard before or create dependency, based on the location in the DOM
var template = require('./wizard-tabs.html');
import * as $ from 'jquery';

export default function(Wizard, $timeout, $rootScope, $state) {
		return {
			restrict: 'A',
			templateUrl: template,
			scope: {
				done: '='
			},
			transclude: false,
			link: function(scope, elem, attrs) {
				var
					id = attrs.wId,
					navigate;

				if (!id) throw Error('Id attribute must be specified for wizard.');

				// there is a delay with this method returning
				// we need an immediate result for the list of states
				scope.states = Wizard.subscribe(id, function(wizard) {
					if (wizard.tabs) scope.buttonHide = false;
					scope.tabs = wizard.tabs;
					scope.states = _.map(wizard.tabs, 'state');
					showTabSet();
				});

				function showTabSet (state) {
					state = state || $state.$current.name;
					if (scope.states && scope.states.indexOf(state) >= 0) {
						$(elem).show();
					} else {
						$(elem).hide();
					}
					// Check for a tabs array, and make sure the enabled properties are set.
					if (scope.tabs) {
						scope.tabs.forEach((tab) => {
							if (tab.enabled && $rootScope.$eval(tab.enabled) === undefined) {
								Wizard.setupTabEnabled(tab.enabled);
							}
						});
					}

					Wizard.calculateDisabledTabs(id, scope);
				}

				function setActiveTab (state) {
					if (scope.states && scope.states.indexOf(state) >= 0 && id)
						Wizard.update(id, null, state);
				}

				// determine whether or not to show tabs based on base url
				showTabSet();

				$rootScope.$on('$stateChangeSuccess', function(e, state) {
					var dest = state.name;
					showTabSet(dest);
					setActiveTab(dest);
				});

				$rootScope.$on('wizard save start', function(e) {
					scope.saving = true;
				});

				$rootScope.$on('wizard save end', function(e) {
					scope.saving = false;
					if (navigate) {
						Wizard.update(id, navigate.id);
						navigate = null;
					}
				});

				scope.activate = function(tab) {
					// saving is now handled through here
					if (!scope.saving) {
						Wizard.update(id, tab.id);
					} else {
						navigate = tab;
					}
				};

				scope.goTo = function(state) {
					$state.go(scope.done);
				};

			}
		};
	};
