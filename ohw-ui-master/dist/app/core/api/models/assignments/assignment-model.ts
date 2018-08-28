'use strict';

export default function(API, AssignmentAPIHelper, $http) {

    var hasSubmissions = []; // Store with assignment, but this is a list of flags retrieved from getGradebook with course ID.


    const IMPORT_FAILED = null;

    // This is meant to check for an error message in a successful server response. Specifically,
    // check for Fatal error: Allowed memory size of [n] bytes exhausted ...
    function isFatalError(data) {
      var result = false;
      if (typeof data.data === 'string') {
        result = data.data.match(/Fatal error:/);
      }
      return result;
    }

    // Success handler for getImportable. Because it's possible for the server to return successfully,
    // even though there was an error that made the intended payload unavailable, we want to check the
    // payload for an error message before returning it. If there is an error, we return null instead of
    // the data. A null will trigger a reject rather than a resolve in the function that calls getImportable.
    function importSuccess(res) {
      if (isFatalError(res)) {
        return IMPORT_FAILED;
      } else {
        return res;
      }
    }

    // Failure handler for getImportable. This is straightforward: if the assign/import REST call fails,
    // return a null, so the function that calls getImportable will return a reject rather than a resolve.
    function importFailure(res) {
      return IMPORT_FAILED;
    }

    var Assignment = {};

    Assignment.getByCourseId = function(id) {
      var url = API.BASE + 'assign/list/' + id;
      return $http.get(url, { cache: false });
    };

    Assignment.getImportable = function() {
      var url = API.BASE + 'assign/import';
      return $http.get(url, {cache: false}).then(importSuccess, importFailure);
    };

    Assignment.getById = function(id) {
      var url = API.BASE + 'assign/' + id;
      return $http.get(url, { cache: false }).then(AssignmentAPIHelper.saveDueDate);
    };

    Assignment.getProblems = function(id) {
      var url = API.BASE + 'assign/bystandard/' + id;
      return $http.get(url, {
		cache: false,
        transformResponse: API.appendTransform(AssignmentAPIHelper.getProblems)
      });
    };

    Assignment.getHierarchy = function(id) {
      var url = API.BASE + 'assign/gethierarchy/' + id;
      return $http.get(url, {
		cache: false,
        transformResponse: API.appendTransform(AssignmentAPIHelper.getHierarchy)
      });
    };

    Assignment.save = function(payload) {
      var url = API.BASE + 'assign';
      return $http.put(url, payload);
    };

    Assignment.update = function(id, payload) {
      var url = API.BASE + 'assign/dates/' + id;
      return $http.put(url, payload);
    };

    Assignment.updateInstance = function(id, studentId, payload) {
      var url = API.BASE + 'assign/dates/' + id + '/' + studentId;
      return $http.put(url, payload);
    };

    Assignment.importToCourse = function(id, vname, courseId) {
      var url = API.BASE + 'assign/import/' + id;
      var payload = {
        'name': vname,  //this must have name in the payload
        'description': '',
        'assigned': '',
        'due': '',
        'notes': '',
        'courseId': courseId || ''
      };
      return $http.put(url, payload);
    };

    Assignment.del = function(id) {
      var url = API.BASE + 'assign/' + id;
      return $http.delete(url);
    };

    Assignment.getPending = function(id) {
      var url = API.BASE + 'assign/' + id + '/status/Pending';
      return $http.get(url, { cache: false });
    };

    Assignment.getStudent = function(id, studentId) {
      var url = API.BASE + '/assign/' + id + '/student/' + studentId + '/grade';
      return $http.get(url, { cache: false });
    };

    Assignment.getStudentInstance = function(id, studentId) {
      var url = API.BASE + '/assign/' + id + '/student/' + studentId;
      return $http.get(url, { cache: false });
    };

    Assignment.setHasSubmissions = function(submission_check) {
      hasSubmissions = submission_check;
    };

    Assignment.getHasSubmissions = function() {
      return hasSubmissions;
    };

    return Assignment;

  };
