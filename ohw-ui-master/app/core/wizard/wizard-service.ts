'use strict';

export default function($rootScope) {

		var Wizard = {};

		Wizard.registered = [];

		Wizard.register = function(id, tabs) {
			var
				obj = { id: id },
				index = Wizard.getIndexById(id),
				result;
			if (index >= 0) {
				Wizard.registered[index].tabs = tabs;
				var wizard = Wizard.getById(id);
			} else {
				result = Wizard.registered.push({
					id: id,
					tabs: tabs
				});
			}
			Wizard.notify(id);
			return Wizard.getById(id);
		};

		Wizard.subscribe = function(id, callback, source) {
			var wizard = Wizard.getById(id);
			var index = Wizard.getIndexById(id);
			if (!wizard) {
				wizard = Wizard.register(id);
				index = Wizard.getIndexById(id);
			}
			if (wizard && callback) {
				Wizard.registered[index].callbacks = Wizard.registered[index].callbacks || [];
				Wizard.registered[index].callbacks.push(callback);
				return _.map(wizard.tabs, 'state'); // return tab states for proper init
			} else
				return false;
		};

		Wizard.getTabsById = function(id) {
			var wizard = Wizard.getById(id);
			var hasTabs = wizard && _.has(wizard, 'tabs') && wizard.tabs;
			if (hasTabs) {
				return wizard.tabs;
			} else {
				return false;
			}
		};

		Wizard.calculateDisabledTabs = function(wizardId, scope) {
			var index = Wizard.getIndexById(wizardId);
			var tabs = Wizard.getTabsById(wizardId);
			if (!tabs) return;
			var activeIndex = _.findIndex(tabs, { active: true });

			var self = this;

			self.isEnabled = function(tab) {
				return $rootScope.$eval(tab.enabled);
			};

			if (activeIndex === 0) {
				// reset all tabs to disabled except for [0]
				_.each(tabs, function(tab, i) {
					if (i > 0) {


						Wizard.registered[index].tabs[i].disabled = true && !self.isEnabled(tab);
					}
				});
			} else {
				_.each(tabs, function(tab, i) {
					if (_.has(tab, 'require') && tab.require && !tab.active) {
						var requireIndex = _.findIndex(tabs, { id: tab.require });
						if (activeIndex >= requireIndex && !tab.drillOnly) {
							Wizard.registered[index].tabs[i].disabled = false;
						} else {
							Wizard.registered[index].tabs[i].disabled = true && !self.isEnabled(tab);
						}
					}
				});
			}

			if (_.map(tabs, 'condition').length >= 0) {
				_.each(tabs, function(tab, i) {
					if (_.has(tab, 'condition')) {
						$rootScope.$watch(tab.condition, function(n, o) {
							if (n) {
								Wizard.registered[index].tabs[i].disabled = false;
							} else {
								Wizard.registered[index].tabs[i].disabled = true && !self.isEnabled(tab);
							}
						});
					}
				});
			}

			// any tab with 'enabled' will be on all the time
			// if (_.map(tabs, 'enabled').length >= 0) {
			// 	_.each(tabs, (tab, i) => {
			// 		if (_.has(tab, 'enabled')) {
			// 			$rootScope.$watch(() => {
			// 				return self.isEnabled(tab);
			// 			}, (n) => {
			// 				console.log('watching enabled: ', n);
			// 				if (n) {
			// 					Wizard.registered[index].tabs[i].disabled = false;
			// 				}
			// 			});
			// 		}
			// 	});
			// }

			return;

		};

		Wizard.setActiveTab = function(wizardId, tabId) {
			var index = Wizard.getIndexById(wizardId);
			var tabs = Wizard.getTabsById(wizardId);
			_.each(tabs, function(tab, i) {
				if (tab.id === tabId) {
					Wizard.registered[index].tabs[i].active = true;
					Wizard.registered[index].tabs[i].disabled = false;
				} else {
					Wizard.registered[index].tabs[i].active = false;
				}
			});
			Wizard.calculateDisabledTabs(wizardId);
			return Wizard.notify(wizardId);
		};

		// set active tab when:
		//	 - route is navigated to
		//	 - activeTab: tab id
		Wizard.update = function(id, tabId, state) {
			var index = Wizard.getIndexById(id);
			var tabs = Wizard.getTabsById(id);
			if (!tabs) return false;
			if (state && !tabId) {
				tabId = _.find(tabs, { state: state });
				if (!tabId) throw Error('Could not match state provided with config object.');
				tabId = tabId.id;
			} else {
				if (!tabId) {
					var result = _.find(tabs, { active: true });
					if (_.has(result, 'id')) {
						tabId = result.id;
					} else {
						throw Error('Could not navigate with no tabId provided');
					}
				}
			}
			Wizard.setActiveTab(id, tabId);
		};

		// This is to set the tab enabled flag, which is ordinarily set
		// when an assignment is clicked from the Assignment List but
		// which gets lost if one of the tab pages is refreshed.
		Wizard.setupTabEnabled = function(enabled) {
			// This approach assumes an "enabled" key in the form section.tab; e.g., assignGen.edit
			var parts = enabled.split('.');
			var obj = parts[0];
			var prop = parts[1];
			try {
				$rootScope.$eval(obj);
			} catch (e) {
				$rootScope.$eval(obj + '={}');
			}
			$rootScope.$eval(obj + '.' + prop + '=true');
		};

		Wizard.destroy = function(index) {
			var result = Wizard.registered.splice(index, 1);
			return !!result.length;
		};

		Wizard.getById = function(id) {
			return _.find(Wizard.registered, { id: id });
		};

		Wizard.getIndexById = function(id) {
			return _.findIndex(Wizard.registered, { id: id });
		};

		Wizard.notify = function(id) {
			var wizard = Wizard.getById(id);
			var activeTab = wizard.tabs ? _.find(wizard.tabs, { active: true }) : false;
			if (wizard.callbacks && wizard.callbacks.length) {
				_.each(wizard.callbacks, function(callback) {
					callback(wizard, activeTab);
				});
			}
		};

		return Wizard;

	};
