'use strict';


// A Publish-Subscribe Event Manager
//
// Yanked from: https://gist.github.com/turtlemonvh/10686980/038e8b023f32b98325363513bf2a7245470eaf80
//
// DG: Is it efficient using $rootScope as the event manager? We could almost as easily manage it
// internally, without having to worry about slowing down other consumers of $rootScope.
// The auto-unbind when $scopes are destroyed is very convenient, removing the need for an
// unsubscribe function. If we move the event management to this module, we should duplicate
// that functionality.

angular.module('core.pubsub', [])

.factory('PubSub', function($rootScope) {

	var shift = [].shift;


	// Publish an event, along with optional data

	function publish(msg, data) {
		if (typeof data === 'undefined')
			data = {};
		$rootScope.$emit(msg, data);
	}


	// Subscribe to an event

	function subscribe(msg, func, scope) {
		var unbind = $rootScope.$on(msg, function() {
			Array.prototype.shift.apply(arguments);		// Remove the "event" parameter that was passed in
			func.apply(func, arguments);
		});
		if (scope)
			scope.$on('$destroy', unbind);
	}


	// PUBLIC API

	return {
		publish: publish,
		subscribe: subscribe
	};
});
