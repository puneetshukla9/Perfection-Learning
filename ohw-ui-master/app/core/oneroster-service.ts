'use strict';

export default function(AppState) {

	// OneRoster service

	function isLockedOut() {
    return AppState.get('oneroster_lockout');
	}

	// Public API

	return {
		isLockedOut: isLockedOut
	};

};
