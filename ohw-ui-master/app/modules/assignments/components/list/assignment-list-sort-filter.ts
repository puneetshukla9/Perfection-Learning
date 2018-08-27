'use strict';

export default function() {
  var byField;
  var direction;

  function isDateField(field) {
    return (field === 'assigned' || field === 'due');
  }

  // The reason for the custom sort is to allow unassigned dates to be sorted to the bottom, regardless of sort order.
  function sortByDate(a, b) {
    if (a[byField] === null && b[byField] === null) {
      return useListOrder(a, b);
    } else if (a[byField] === null) {
      return 1;
    } else if (b[byField] === null) {
      return -1;
    } else {
      return basicSort(a[byField], b[byField]);
    }
  }

  function useListOrder(a, b) {
      return basicSort(a.sortOrder, b.sortOrder);
  }

  function basicSort(a, b) {
    if (a < b) {
      return -1 * direction;
    } else if (a > b) {
      return direction;
    } else {
      return 0;
    }
  }

  return function(items, sortSpec) {
    direction = (sortSpec[0].substr(0, 1) === '-') ? -1 : 1;
    var field = (direction === -1) ? sortSpec[0].substr(1) : sortSpec[0];
    byField = field === 'name' ? sortSpec[1] : field;
    if (isDateField(byField)) {
      items.sort(sortByDate);
    } else {
      items.sort(useListOrder);
    }
    return items;
  };
};
