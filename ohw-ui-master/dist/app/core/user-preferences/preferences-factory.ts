'use strict';

export default function(Util, AppState, $state, $http, $rootScope, PubSub) {

  // init(category) -- run block, this fetches the mongo and fills in blanks with the default config json
	// get(category, key) - get value
	// set(category, key) - set value, send to backend, call

	var Prefs = {};
	var menuData = [];
	var modulePrefs = {};

	var preferenceDefaults = require('./preference-defaults.json');
	var preferences = preferenceDefaults.main;
	var textMap = preferenceDefaults.map;

	function shufflePrefObject(obj) {
		var result = {};
		for (var key in obj) {
			var category = obj[key].category;
			var value = obj[key].val;
			result[category] = result[category] || {};
			result[category][key] = value;
		}
		return result;
	}

	Prefs.init = function() {
		var obj = shufflePrefObject(window.ohw.prefs).main;
		preferences = _.merge(preferences, obj);
		$rootScope.$broadcast('preferences initialized');
	};

	Prefs.get = function(key) {
		if (!preferences) return;
		return preferences[key];
	};

	Prefs.set = function(key, value) {
		var prefObj = {};
		prefObj[key] = { name: key, val: value, category: 'main' };
		if (!key) return;
		return Util.setPrefs(prefObj).then(function() {
			preferences[key] = value;
			$rootScope.$broadcast('preferences changed', preferences);
		});
	};

	Prefs.buildMenu = function(items) {
		var result = [];
		_.each(items, (item, i) => {
			var preference = _.find(textMap, { preference: item });
			preference.state = Prefs.get(item);
			result.push(preference);
		});
		return result;
	};

	return Prefs;

};
