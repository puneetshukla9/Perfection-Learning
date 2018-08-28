'use strict';

export default function(DateConvert, Calendar) {

    var Helper = {};

    // need to add ability for 11:59

    Helper.validate = function(assigned, due) {
      if (assigned && isNaN(assigned.getTime())) assigned = null; // need to detect 'Invalid Date'
      if (due && isNaN(due.getTime())) due = null;

      var result = { assigned: null, due: null };

      if (assigned && assigned < Calendar.today) {
        assigned = Calendar.today;
      }

      if (due && due < Calendar.today) {
        due = Calendar.today;
      }

      var weekBefore = Calendar.getDateOffsetByDays(due, -7);

      if (assigned && !due) {
        result.assigned = assigned;

      } else if (!assigned && due) {
        // assigned date is either 7 days before the due date, or the current date
        if (weekBefore < Calendar.today) {
          result.assigned = Calendar.today;
        } else {
          result.assigned = weekBefore;
        }
        result.due = due;
      } else if (assigned && due) {
        if (assigned > due) {
          // assigned date is either 7 days before the due date, or the current date
          if (weekBefore < Calendar.today) {
            result.assigned = Calendar.today;
          } else {
            result.assigned = weekBefore;
          }
        } else {
          result.assigned = assigned;
        }
        result.due = due;
      }

      result.assigned = result.assigned === null ? '' : DateConvert.dateObjToString(result.assigned);
      result.due = result.due === null ? '' : DateConvert.dateObjToString(result.due);
      return result;
    };

    return Helper;

  };
