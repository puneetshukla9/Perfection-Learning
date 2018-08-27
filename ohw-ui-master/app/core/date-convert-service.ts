'use strict';


// Convert strings to Date objects and back again.

export default function() {

	var self = this;


	// Split a time string (11:30 | 21:45) into hours and minutes

	function parseTime(timeStr) {
		var parts = timeStr.match(/(\d+):(\d+)/);
		return {hour: parts[1], minute: parts[2]};
	}


	// Sets the time for an existing date object given a time string

	function setTime(dateObj, timeStr) {
		var time = parseTime(timeStr);	// Parse time string

		// Update time
		dateObj.setHours(time.hour);
		dateObj.setMinutes(time.minute);
		dateObj.setSeconds(0);

		return dateObj;
	}


	// Convert a time string to a date object

	function timeStrToObj(timeStr) {
		var out = new Date();	// Today -- Doesn't accept (null | undefined | '') -- It must have no arguments at all

		return setTime(out, timeStr);
	}


	// Convert date and time strings to a date object

	function dateTimeStrToObj(dateStr, timeStr) {
		var out = new Date(dateStr);
		return setTime(out, timeStr);
	}


	// Converts a Date object to a time string (24 hour)

	function dateObjToTime(dateObj) {
		var hour = dateObj.getHours();

		var min = dateObj.getMinutes();
		if (min < 10)
			min = '0' + min;

		return hour + ':' + min;
	}


	// Converts a date object to a date/time string
	//
	// We're using ISO 8601 date format for communications

	function dateObjToString(dateObj) {
		var dateStr = '';
		try {
			dateStr = dateObj.toISOString();
		} catch (e) { }
		return dateStr;
	}


	// Public API

	return {
		setTime: setTime,
		timeStrToObj: timeStrToObj,
		dateTimeStrToObj: dateTimeStrToObj,
		dateObjToTime: dateObjToTime,
		dateObjToString: dateObjToString
	};

};
