'use strict';

// hash of bootstrap properties to adjust, and corresponding adjustment functions
var adjustBootstrap = {
  //------------------------------------------------------------------------------
  // Bootstrap property affected: curCourse
  // The bootstrap call returns curCourse as the current course ID. It's not clear
  // why. Adjust it here to use the course object from the courses list. This
  // object contains the course ID.
  //------------------------------------------------------------------------------
  curCourse: (data) => {
    if (typeof data.curCourse === 'number') {
      let courseObj = _.find(data.courses, { id: data.curCourse });
      data.curCourse = courseObj;
    }
    return data;
  },

  //------------------------------------------------------------------------------
  // Bootstrap property affected: stdList
  // The bootstrap call returns the stdList array, which contains the tabs used
  // for the Questions selection in the Assignment Generator. This function allows
  // allows us to omit the Standards tab.
  //------------------------------------------------------------------------------
  stdList: (data) => {
    /*
    Commenting this out, as we no longer want to omit the Standards tab.
    https://trello.com/c/8676Lpsx/355-make-standards-available-and-standards-tab-available-in-the-assignment-generator-for-the-national-version-of-fpp

    var curBookId = data.curCourse && data.curCourse.book_id;
    if (curBookId === 66) {
      let tabList = data.stdList.filter((item) => { return item.tab !== 'Standards'; });
      data.stdList = tabList;
    }
    */
    return data;
  }
};

export class MassageBootstrap {

	process(res) {
    var data = res.data || res;
    var keys = Object.keys(data);
    keys.forEach((key) => adjustBootstrap[key] && adjustBootstrap[key](data));
    return res;
	}

}
