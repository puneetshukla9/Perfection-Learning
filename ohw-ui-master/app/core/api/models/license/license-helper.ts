'use strict';

export default function($http, $cacheFactory, DateConvert, Util, API, Config, State, AppState, PubSub) {

  var LicenseHelper = {};

  LicenseHelper.clearCache = function(url) {
    var $httpDefaultCache = $cacheFactory.get('$http');
    $httpDefaultCache.remove(url);
  };

  // Sort licenses alphabetically. Used by license dropdown in Add Class.
  LicenseHelper.sort = function(a, b) {
    // Adjust license names so the sort is case-insensitive.
    var normalized_a = typeof a.license === 'string' ? a.license.toLowerCase() : '';
    var normalized_b = typeof b.license === 'string' ? b.license.toLowerCase() : '';
    return normalized_a < normalized_b ? -1 : normalized_a > normalized_b ? 1 : 0;
  };

  LicenseHelper.save = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    data = _.map(data, (item) => {
      item.product_id = parseInt(item.product_id, 10);
      item.remaining_seats = parseInt(item.remaining_seats, 10);
      item.seats_purchased = parseInt(item.seats_purchased, 10);
      return item;
    });

    // only return if seats availaible
    data = _.filter(data, item => item.seats_purchased > 0);
    State.set('licenses', data);
    return data;
  };

  // PLC Admin-specific treatment of license data, if needed.
  LicenseHelper.saveForPLC = function(res) {
    var data = _.has(res, 'data') ? res.data : res || [];
    State.set('licenses', data);
    return data;
  };

  LicenseHelper.saveAllLicenses = function(filter) {
    var products = filter && filter.products ? filter.products : Config.PRODUCTS_FOR_LICENSE;
    return (res) => {
      var data = _.has(res, 'data') ? res.data : res || [];
      var adjusted = [];
      _.each(data, (item) => {
        _.each(item.licenses, (license) => {
          var obj = {};
          obj.sb_id = parseInt(license.sb_id, 10);
          obj.product_id = parseInt(license.product_id, 10);
          obj.seats_purchased = parseInt(license.seats_purchased, 10);
          obj.expire_date = license.expires;
          obj.start_date = license.start_date;
          obj.ordersid = '';
          obj.walength = '';
          obj.book_name = license.book_name;
          obj.license = license.title;
          obj.remaining_seats = parseInt(license.remaining_seats, 10);
          obj.registration_code = license.registration_code;
          obj.seats_used = license.seats_purchased - license.remaining_seats;
          obj.school_id = item.school_id;
          obj.school_name = item.name;
          obj.is_district = item.is_district;
          if (products.indexOf(obj.product_id) !== -1) {
            var tmp = _.find(adjusted, { product_id: obj.product_id, school_id: obj.school_id });
            if (tmp) {
              tmp.seats_purchased += obj.seats_purchased;
            } else {
              adjusted.push(obj);
            }
          }
        });
      });
      // only return if seats availaible
      data = _.filter(adjusted, item => item.seats_purchased > 0);
      State.set('licenses', data);
      if (State.get('classes') && State.get('classes').length > 0) {
        LicenseHelper.correctSeatsUsed();
      }
      // Added district_schools check to deal wtih race condition when district_classes already loaded but district_schools had not.
      // LicenseHelper.compileLicenseData uses both of these, so both have to be set.
      //console.log('Litmus Test, Part 2. If you see this first, reload.');
      if (State.get('district_classes') && State.get('district_classes').length > 0 &&
          State.get('district_schools') && State.get('district_schools').length > 0) {
        LicenseHelper.compileLicenseData();
      }
      return data;
    };
  };

  // Adjust license seats_used for teacher license data. District license data is done in compileLicenseData.
  LicenseHelper.correctSeatsUsed = function() {
    var student_counts = {};
    _.each(State.get('classes'), (item) => {
      var product_id = parseInt(item.book_id, 10);
      if (!student_counts[product_id]) { student_counts[product_id] = 0; }
      student_counts[product_id] += item.student_count;
    });
    var licenses = State.get('licenses');
    _.each(licenses, (license) => {
      var product_id = license.product_id;
      if (student_counts[product_id] !== undefined) {
        license.remaining_seats = license.seats_purchased - student_counts[product_id];
        license.seats_used = student_counts[product_id];
        student_counts[product_id] = 0;
      }
    });
    State.set('licenses', licenses);
  };

  // There can be multiple districts. To keep from overwriting, each must be its own array or object element.
  // Thus, 'district_licenses' state must contain an entry for each district.
  LicenseHelper.filterStudentData = function(licenses) {
    return _.filter(licenses, license => {
      return _.indexOf(Config.STUDENT_PRODUCTS_FOR_LICENSE, license.product_id) >= 0;
    });
  };

  LicenseHelper.filterDistrict = function(licenses) {
    return _.filter(licenses, license => {
      return license.is_district;
    });
  };

  LicenseHelper.filterSharedData = function(licenses) {
//    var sharedProducts = _.uniq(AppState.get('courses').map(item => item.book_id));
//    var sharedProducts = _.uniq(AppState.filteredCourses.map(item => item.book_id));
    // AppState.filteredCourses.map was issuing an error, since it's a function and so doesn't have the .map property.
    var filteredCourses = AppState.filteredCourses();
    var sharedProducts = _.uniq(filteredCourses.map(item => item.book_id));
    if (sharedProducts === undefined) return [];
    return _.filter(licenses, license => {
      return _.indexOf(sharedProducts, license.product_id) >= 0;
    });
  };

//  LicenseHelper.compileLicenseData = function(district_licenses) { // data is now an array of district_licenses data.
/*
  Rules, from Javeed:
1. District receives a license with 100 seats_purchased, 100 remaining_seats
2. District allocates license to school for 20 seats
3. School gets a new license created with 20 seats_purchased, 20 remaining_seats
4. District's copy of license now has 100 seats_purchased, 80 remaining_seats
5. Upon deallocation, schools license is deleted, and districts copygets back the seats, setting it back to 100 / 100
*/
  LicenseHelper.compileLicenseData = function() {
    var district_schools = State.get('district_schools');
    if (!AppState.get('isDistAdmin')) {
      district_schools = State.get('schools');
    } else {
      // If this is a district admin, we want to count the license data for each school, as well as for the district school.
      // It was pointed out that the school licenses were being left out of the list. This was because the
      // license information for the district didn't include a compilation of license information from each school.
      // Adding the array of school data to the district schools array fixes that.
      // Currently, the school array is stored in the district school object. Should it instead be added to the
      // district_schools array?
      var schools = district_schools[0].schools;
      district_schools.push(...schools);
    }

    var courses = State.get('district_classes');
    var districtIds = district_schools ? _.map(district_schools, (item) => { return parseInt(item.district_id, 10); }) : [];
    var license_schools = {};
    var total_student_count = {};
    var district_purchased = {};
    var licenses = [];
    _.each(district_schools, (district) => {
      _.each(district.licenses, (license, product_id) => {
        district_purchased[product_id] = license.seats_purchased;
      });
    });

    //  Compile data for License Detail page.
    _.each(courses, (course) => {
      var prod_id = parseInt(course.book_id, 10);
      if (districtIds.indexOf(course.school_id) === -1) {
        var key = prod_id + '_' + course.school_id;
        if (!license_schools[key]) {
          license_schools[key] = {
            product_id: prod_id,
            license_name: course.license,
            seats_purchased: district_purchased[prod_id],
            school_id: course.school_id,
            school_name: course.school_name,
            student_count: parseInt(course.student_count, 10)
          };
        } else {
          license_schools[key].student_count += parseInt(course.student_count, 10);
        }

        if (!total_student_count[prod_id]) {
          total_student_count[prod_id] = 0;
        }
        total_student_count[prod_id] += parseInt(course.student_count, 10);
      }
    });
    // Build list to populate Manage All Licenses page.
    _.each(district_schools, (district) => {
      _.each(district.licenses, (license, product_id) => {
        var id = parseInt(product_id, 10);
        district_purchased[license.product_id] = license.seats_purchased;
        var student_count = total_student_count[id] ? total_student_count[id] : 0;
        var license_name = license.name || license.title;
        if (Config.ALL_STUDENT_PRODUCTS.indexOf(id) !== -1) {
          licenses.push({
            id: id,
            district_product: district.district_id + '_' + id,
            license: license_name,
            district_name: district.district_name || 'From license-helper',
            school_name: district.name,
            remaining_seats: license.seats_purchased - student_count,
            seats_used: student_count,
            start_date: license.start_date,
            expire_date: license.expire_date
          });
        }
      });
    });
    State.set('district_licenses', licenses);
    State.set('license_distribution', license_schools);
  };

  return LicenseHelper;

};
