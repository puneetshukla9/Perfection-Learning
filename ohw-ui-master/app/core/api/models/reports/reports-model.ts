'use strict';

export default function(API, $http) {

    var Report = {};

    Report.getProblems = function(list) {
      var url = API.BASE + 'problems/list';
      return $http.put(url, list).then(function(data) {
        var probIDs = {};
        _.each(data, function(problem) {
          probIDs[problem.id] = problem;
        });
        return probIDs;
      });
    };

    Report.getVTPProblems = function(assignId, studentId) {
      var url = API.BASE + 'assign/' + assignId + '/student/' + studentId + '/grade';
      return $http.get(url).then(function(data) {
        var problems = _.map(data, (record) => { return record.problem; });
        return problems;
      });
    };

    return Report;

  };
