'use strict';

export default function($http, SchoolHelper, API, State, PubSub) {

  var School = {};

  School.getById = function(id) {
    var url = API.BASE + 'admin/school/students/all/school/' + id;
    return $http.get(url).then(SchoolHelper.save);
  };

  School.getforCurrentUser = function() {
    var url = API.BASE + 'admin/schools/user/current';
    return $http.get(url).then(SchoolHelper.save); //.then(SchoolHelper.save);
  };

  School.getDistrictForUser = function() {
    var url = API.BASE + 'admin/schools/user/current';
    return $http.get(url).then(SchoolHelper.saveDistrict);
  };

  School.all = function(appState) {
    if (appState && appState.get('isPLCAdmin')) {
      var url = API.BASE + 'plcadmin/schools';
      return $http.get(url).then(SchoolHelper.plcSave);
    } else {
      var url = API.BASE + 'admin/district/schools/all';
      return $http.get(url).then(SchoolHelper.save);
    }
  };

  School.getSchoolsByDistrict = function(districtObj) {
  	var url = API.BASE + 'admin/district/schools/all/district/' + districtObj.district_id;
    var saveForDistrict = SchoolHelper.saveForDistrict(districtObj);
  	return $http.get(url).then(saveForDistrict);
  };

  School.getProductListByID = function(id) {
    var url = API.BASE + 'admin/licenses/list/product/school/id/' + id;
  	return $http.put(url).then(SchoolHelper.saveProducts);
  };

  return School;

};
