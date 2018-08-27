'use strict';

import * as moment from 'moment';

export default function() {

    var Calendar = {};

    Calendar.data = {};

    Calendar.open = function(event, id) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      Calendar.data[id] = true;
    };

    Calendar.isOpen = function(id) {
      return Calendar.data[id];
    };

    Calendar.toggle = function(event, id) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      Calendar.data[id] = !Calendar.data[id];
    };

    Calendar.close = function(event, id) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      Calendar.data[id] = false;
    };

    Calendar.today = new Date();

    Calendar.getDateOffsetByDays = function(date, offset) { // offset is in days
      return moment(date).add(offset, 'days');
      //return Calendar.today.setDate(Calendar.today.getDate() + offset);
    };

    Calendar.options = {
      showWeeks: false,
      startingDay: 1
    };

    return Calendar;

  };
