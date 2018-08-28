'use strict';

import calendarModule from './calendar-module.ts';
import calendarHelper from './calendar-helper-service.ts';
import calendarService from './calendar-service';
import './calendar.less';

export default angular.module('core.calendar', [])
	.factory('Calendar', calendarService)
	.factory('CalendarHelper', calendarHelper);
