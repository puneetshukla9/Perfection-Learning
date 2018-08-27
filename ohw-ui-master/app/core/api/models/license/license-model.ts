'use strict';

export default function(LicenseHelper, $http, $q, API, State, PubSub) {

  var License = {};

  License.get = function(products) {
    var url;
    url = API.BASE + 'admin/licenses/list/product/school';
    return $http.put(url, products).then(LicenseHelper.save);
  };

  // getAllLicenses is meant to replace get (above)
  License.getAllLicenses = function(filter) {
    var url;
    url = API.BASE + 'admin/district/schools/all';
    return $http.get(url).then(LicenseHelper.saveAllLicenses(filter));
  };

  // getForPLC: PLC Admin-specific retrieval of license data, in case needed.
  License.getForPLC = function() {
    var defer = $q.defer();
    defer.promise.then(LicenseHelper.saveForPLC);
    return defer.resolve({ data: [] });
  };

  License.getByDistrict = function() {
    var url;
    url = API.BASE + 'admin/district/licenses/list';
    return $http.get(url).then(LicenseHelper.save);
  };

  License.addUser = function(userId, licenseId) {
    var url;
    url = API.BASE + 'admin/user/' + userId + '/license/' + licenseId + '/add';
    return $http.put(url, {}).then(LicenseHelper.save);
  };

  License.plcLicenseSearch = function(schoolSearch) {
    var url = API.BASE + 'plcadmin/licenses';
    var payload = { school_search: schoolSearch };
    return $http.put(url, payload).then(LicenseHelper.save);

  };

  License.plcLicenseEdit = function(id, data) {
    var url = API.BASE + 'plcadmin/license/' + id;
    var payload = data;
    return $http.put(url, payload);
  };

  // moved to user, it's really part of that entity (as denoted in url)
  // License.addUser = function(id, userId) {
  //   var url;
  //   url = API.BASE + 'admin/user/' + userId + '/license/' + id + '/add';
  //   return $http.put(url, userId);
  // };

  return License;

};
