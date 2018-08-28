/*
  Set up to allow saving of pagination state within each section.
*/
'use strict';

export default function($state) {
  var settings = {};
  var lastSection;

  // Private function for getting the section name for use as a hash key.
  // Originally, this retrieved a portion fo the state name, corresponding
  // to a menu option; however, as there can be multiple grid instances within
  // the same option (e.g., Manage All Classes, Roster), we're using the
  // full state name to save pagination state.
  function getSection() {
    var currentSection = $state.current.name;
    return currentSection;
  }

  /*
   * Public Functions
   */

  // set: store gridOptions settings for later reference.
  function set(gridOptions) {
    var section = getSection();
    if (!settings[section]) {
      settings[section] = {};
    }
    if (gridOptions.paginationPageSize) {
      settings[section].paginationPageSize = gridOptions.paginationPageSize;
    }
    if (gridOptions.paginationCurrentPage) {
      settings[section].paginationCurrentPage = gridOptions.paginationCurrentPage;
    }
  }

  // get: retrieve previously stored gridOptions settings.
  function get(gridOptions) {
    var section = getSection();
    if (settings[section] && Object.keys(settings[section]).length > 0) {
      gridOptions.paginationPageSize = settings[section].paginationPageSize;
      gridOptions.paginationCurrentPage = settings[section].paginationCurrentPage;
    }
  }

  return {
    set: set,
    get: get
  };
};
