'use strict';

export default function(AppState, State, Sort, $cacheFactory) {

    var AssignmentAPIHelper = {};

    /*
     * filterProblems.
     * Include the filter for bankType === 'problem', which was formerly in getProblems.
     * Also, filter out enhanced problems for states to which they don't apply currently.
     */
    var includeEnhancedProblemsFor = ['FL', 'NY'];
    var includeProducts = ['languagearts'];
    var ProblemIDFilter = 100000;
    function filterProblems(problems) {
      problems = problems.filter((item) => { return item.bankType === 'problem'; });

      // Filter out enhanced problems.
      var course = AppState.get('curCourse');
      // Do the filtering if there's no product_state for this course, or if there is a product_state but
      // that state isn't in the list of those that should see enhanced problem types.
      if (includeProducts.indexOf(course.product) === -1 && includeEnhancedProblemsFor.indexOf(course.product_state) ===  -1) {
        problems = problems.filter((item) => {
          // Filter problems out IF there's a presentation_data type
          // OR if the problem ID > the ProblemIDFilter.
          let filterOut = !!(item.presentation_data && item.presentation_data.type || item.probID > ProblemIDFilter);
          return filterOut === false;
        });
      }

      return problems;
    }

    AssignmentAPIHelper.getHierarchy = function(data) {
      var originalResponse = data;
      data = data.data;
      if (!(data instanceof Array)) return originalResponse;
      _.each(data, (record, i) => {
        record.children = record.children.sort(Sort.keySort('code'));
        record.fullName = record.code + ': ' + record.name;
        for (var index in record.children) {
          record.children[index].fullName = record.children[index].code + ': ' + record.children[index].name;
        }
      });
      data.sort(Sort.keySort('fullName'));
      originalResponse.data = data;

      return originalResponse;
    };

    AssignmentAPIHelper.getProblems = function(data) {
      var originalResponse = data;
      data = data.data;
      if (!(data instanceof Array)) return originalResponse;
      _.each(data, (record, i) => {
        record.probID = record.id;
      });
//      data = data.filter((item) => { return item.bankType === 'problem'; });
      data = filterProblems(data);
      originalResponse.data = data;
      return originalResponse;
    };

    AssignmentAPIHelper.saveDueDate = function(data) {
      State.set('defaultDueDate', data.due);
      return data;
    };

    return AssignmentAPIHelper;
};
