'use strict';

export default function($http, API) {

    var Grade = {};

    Grade.get = function(id) {
      var url = API.REST_BASE + 'grades/' + id;
      return $http.get(url, { cache: false });
    };

    Grade.set = function(data) {
      var url;
      if (data.partIdx > -1) {
        url = API.REST_BASE + 'pset/' + data.aid + '/' + data.qid + '/user/' + data.uid + '/part/' + data.partIdx + '/score';
      } else {
        url = API.REST_BASE + 'pset/' + data.aid + '/' + data.qid + '/user/' + data.uid + '/score';
      }
      return $http.put(url, { score: data.grade });
    };

    return Grade;

  };
