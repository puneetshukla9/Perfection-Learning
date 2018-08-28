'use strict';

export default function(PubSub, $state, FilterManager) {
  PubSub.subscribe('reportChange', reportChange);

  function reportChange(obj) {
    FilterManager.setPreserveFilters(true);
    if (obj.report)
      $state.go('reportsApp.' + obj.report);
  }


};
