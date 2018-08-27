'use strict';

export default function($http, $cacheFactory, Config, API, State, PubSub) {

  var SchoolHelper = {};

  SchoolHelper.formatDate = function(dateStr) {
    var result = '';
    if (dateStr) {
      var tmp = dateStr.split(' ');
      result = tmp[0];
    }
    return result;
  };

  SchoolHelper.sortBySchool = function(a, b) {
    var result = a.name < b.name ? -1 : 1;
    if (a.is_district) result = -1;
    if (b.is_district) result = 1;
    return result;
  };

  SchoolHelper.clearCache = function(url) {
    var $httpDefaultCache = $cacheFactory.get('$http');
    $httpDefaultCache.remove(url);
  };

  function decorateSchoolsWithDistrict(data) {
    var district = _.filter(data, (item) => { return item.is_district; })[0];
    var district_id = district && district.school_id ? district.school_id : null;
    var district_name = district && district.name ? district.name : '';
    _.each(data, (item) => {
      // Add district information to school.
      var checkDistrict = treatAsDistrict(data, item);
      item.treat_as_district = checkDistrict.result;
      item.dist_diagnostic = checkDistrict.diagnostic;
      item.district_id = district_id;
      item.district_name = district_name;
    });
  }

  function decorateSchoolsWithRegistrationCode(data) {
    _.each(data, (item) => {
      // Add registration code. There may be several; just need one.
      var teacherLicense = _.filter(item.licenses, (license) => {
        return Config.REGISTRATION_PRODUCTS.indexOf(parseInt(license.product_id, 10)) !== -1;
      });
      item.registration_code = teacherLicense.length > 0 ? teacherLicense[0].registration_code : '';
    });
  }

  function adjustLicenses(data) {
    var studentCounts = State.get('license_students') || {};
    var total_student_counts = {};
    _.each(data, (item) => {
      var licenses = {};
      // First pass through licenses: change licenses to hash, and get totals for seats_purchased.
      _.each(item.licenses, (license) => {
        license.seats_purchased = parseInt(license.seats_purchased, 10);
        if (!licenses[license.product_id]) {
          licenses[license.product_id] = license;
        } else {
          licenses[license.product_id].seats_purchased += license.seats_purchased;
        }
      });
      item.licenses = licenses;

      // Second pass through licenses:
      _.each(item.licenses, (license, product_id) => {
        var key = license.product_id;
        var student_count = studentCounts[key] ? studentCounts[key] : 0;
        if (!total_student_counts[license.product_id]) { total_student_counts[license.product_id] = 0; }
        total_student_counts[license.product_id] += student_count;
        license.seats_used = student_count;
      });
    });

    var district = _.filter(data, (item) => { return item.is_district; });
    if (district.length > 0) {
      district = district[0];
      var districtLicenses = district.licenses;
      _.each(district.licenses, (license, product_id) => {
        license.seats_used = total_student_counts[product_id];
        license.remaining_seats = license.seats_purchased - total_student_counts[product_id];
      });
    };
  }

  SchoolHelper.isDistrictSchool = function(school_id) {
    //get district schools and return true if school is in the lsit
    var districtSchools = State.get('district_schools');
    return (_.find(districtSchools, { 'district_id' : school_id }) !== undefined);
  };

  // Include district id and name for each school.
  SchoolHelper.save = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    var schoolsIncludingDistrict = _.has(res, 'data') ? res.data : res || [];
    decorateSchoolsWithDistrict(data);
    decorateSchoolsWithRegistrationCode(data);
    adjustLicenses(data);
    State.set('schools', data.sort(SchoolHelper.sortBySchool));
    var district = _.filter(schoolsIncludingDistrict, (item) => { return item.is_district; });
    var schoolsInDistrict = _.filter(schoolsIncludingDistrict, (item) => { return item.treat_as_district === false; });
    var districtSchoolObj = {
      schools: schoolsInDistrict,
      schools_including_district: schoolsIncludingDistrict
    };
    // Previously, none of the districtSchools information was stored unless district.length was > 0.
    // Since it's evidently possible for a list of schools to not include an is_district: true,
    // only the district-specific information is conditional.
    if (district.length > 0) {
      districtSchoolObj.district_id = district[0].school_id;
      districtSchoolObj.district_name = district[0].name;
      districtSchoolObj.licenses = district[0].licenses;
    }
    // The district schools array contains just a single district object, with that object containing
    // a schools array. This was probably to allow for the possibility of multiple districts.
    // Are we expected to have multiple districts for a district admin?
    var districtSchools = [districtSchoolObj];
    State.set('district_schools', districtSchools);
    return data;
  };

  SchoolHelper.plcSave = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    var allSchools = data.sort(SchoolHelper.sortBySchool);
    State.set('schools', allSchools);
    State.set('district_schools', allSchools);
    return allSchools;
  };

/*
A district should be filtered out only if none of the following are true:

1. District School contains non-district-admin level users (students, teachers, etc)
2. District School contains any courses (template courses are an exception but do not exist yet so that will be added later)
3. District School is the only school in the district.

Modified in wake of meeting 2/24:
Remove criteria 1 and 2.
*/
  function treatAsDistrict(schools, item) {
    var _treatAsDistrict = item.is_district;
    var flags = [];
    if (_treatAsDistrict) {
      var districts = _.filter(schools, (item) => { return item.is_district === true; });
      var non_districts = _.filter(schools, (item) => { return item.is_district === false; });
      if (non_districts.length === 0) {
        _treatAsDistrict = false;
        flags.push('non-districts');
      }

      var district_id = districts.length > 0 ? districts[0].school_id : -1;
/*
      var classes = State.get('classes');
      console.log('treatAsDistrict, district_id', district_id);
      console.log('treatAsDistrict classes', classes);
      var dist_courses = _.filter(classes, (item) => { return item.school_id === district_id; });
      if (dist_courses.length > 0) {
        _treatAsDistrict = false;
        flags.push('courses');
      }
*/
/*
      var students = State.get('students') || [];
      var teachers = State.get('teachers') || [];
      students = _.filter(students, (item) => { return item.school_id === district_id; });
      teachers = _.filter(teachers, (item) => { return item.school_id === district_id; });
      if (students.length > 0 || teachers.length > 0) {
        _treatAsDistrict = false;
        flags.push('users');
      }
*/
    }
    return { result: _treatAsDistrict, diagnostic: flags };
  };


  SchoolHelper.saveStudents = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    State.set('schoolStudents', data);
    return data;
  };

  SchoolHelper.saveProducts = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    State.set('products', data);
    return data;
  };

  SchoolHelper.saveDistrict = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    State.set('district', data);
    return data;
  };

  return SchoolHelper;

};
