'use strict';

var CONFIG = require('./../../../config/application-config.json');

export default function($http, $rootScope, Util, PubSub, Course, CourseHelper, Config) {

    var AppState = {};
    // This hash allows control over which bootstrap properties get updated when AppState.refresh is called.
    var updateBootstrapKeys = {'curCourse': false, 'courses': true, 'permissions': true, 'skins': true,
        'hasAmsco': true, 'hasMathx': true, 'books': true, 'showStds': true, 'stdList': true};

    AppState.data = AppState.data || _.extend(window.ohw.appConfig, CONFIG);

    if (AppState.data && _.has(AppState.data, 'courses')) {
      AppState.data.courses = AppState.data.courses.sort(CourseHelper.sorter);
      AppState.data.defaultCourse = AppState.data.curCourse;
      AppState.data.curCourse = AppState.data.courses[0];
      if (AppState.data.courses[0]) {
        Course.setById(AppState.data.courses[0].id).then(() => {
          AppState.refresh();
        });
      }
    }

    if (AppState.data && _.has(AppState.data, 'UIConfig')) {
      // Bootstrap UIConfig probably now includes a number of vestigial properties. Look at removing them.
      var uiConfig = AppState.data.UIConfig;

      // PRODUCTS_FOR_LICENSE includes all products except AMSCO, for teacher and student.
      Config.PRODUCTS_FOR_LICENSE = [];
      // STUDENT_PRODUCTS_FOR_LICENSE includes all products except AMSCO, but only for students.
      Config.STUDENT_PRODUCTS_FOR_LICENSE = [];
      // ALL_STUDENT_PRODUCTS includes all products, including AMSCO, but only for students.
      Config.ALL_STUDENT_PRODUCTS = [];
      // ALL_TEACHER_PRODUCTS includes all products, including AMSCO, but only for teachers.
      Config.ALL_TEACHER_PRODUCTS = [];

      if (uiConfig.student) {
        Object.keys(uiConfig.student).forEach(pl => {
          if (pl !== 'AMSCO') {
            Config.STUDENT_PRODUCTS_FOR_LICENSE = _.union(Config.STUDENT_PRODUCTS_FOR_LICENSE, uiConfig.student[pl]);
          }
          Config.ALL_STUDENT_PRODUCTS = _.union(Config.ALL_STUDENT_PRODUCTS, uiConfig.student[pl]);
        });
      }

      if (uiConfig.teacher) {
        Object.keys(uiConfig.teacher).forEach(pl => {
          if (pl !== 'AMSCO') {
            Config.TEACHER_PRODUCTS_FOR_LICENSE = _.union(Config.TEACHER_PRODUCTS_FOR_LICENSE, uiConfig.teacher[pl]);
          }
//          Config.ALL_TEACHER_PRODUCTS[pl] = uiConfig.teacher[pl].sort();
            Config.ALL_TEACHER_PRODUCTS = _.union(Config.ALL_TEACHER_PRODUCTS, uiConfig.teacher[pl]);
        });
      }

      Config.PRODUCTS_FOR_LICENSE = _.union(Config.STUDENT_PRODUCTS_FOR_LICENSE, Config.TEACHER_PRODUCTS_FOR_LICENSE);
      // Added to provide a list that can be used to show registration codes. Product ID 47 is used for dummy licenses and so
      // was allowing invalid codes to be displayed.
      // Per Javeed: Teacher Access Information should always be showing the registration code for product ID 47.
      //Config.REGISTRATION_PRODUCTS = Config.ALL_TEACHER_PRODUCTS.filter(id => id !== 47);
      Config.REGISTRATION_PRODUCTS = Config.ALL_TEACHER_PRODUCTS.filter(id => id !== -1);
    }

    AppState.refresh = function(cb) {
      Util.getBootstrap().then(function(data) {
        _.each(data, function(val, key) {
          if (updateBootstrapKeys[key]) {
            AppState.data[key] = val;
          }
        });
        // Provide for an action once bootstrap is refreshed.
        if (cb) {
          cb();
        }
      });
    };

    AppState.isAMSCO = function() {
      return true;
    };

    AppState.get = function(key) {
      if (key === 'url') return function(key) { return AppState.data.url[key]; };
      if (AppState.data && AppState.data[key]) {
        return AppState.data[key];
      } else {
        return;
      }
    };

    AppState.set = function(key, value) {
      var WHITELIST = []; //WHITELIST = ['curCourse'];
      if (WHITELIST.indexOf(key) >= 0) {
        return false;
      } else {
        AppState.data[key] = value;
      }
    };

    AppState.getAPIUrl = function() {
      var p = window.location.protocol;
      var w = window.location.hostname;
      var a, result;
      if (w === 'localhost') {
        w = 'test-ohw.kineticmath.com';
        a = p + '//' + w;
        result = { endpoint: a + '/rest/endpoint.php/', rest: a + '/rest/rest.php/' };
      } else {
        a = p + '//' + w;
        result = { endpoint: a + '/api/endpoint/', rest: a + '/api/rest/' };
      }
      return result;
    };

    AppState.getModuleName = function(state) {
      if (!state || !_.has(state, 'name')) return;
      return state.name.split('.')[0];
    };

    /*
     * Filtering mechanism. Separate from the mechanism for filtering the State.
     * This one is specific to courses.
     */
    var filters = {
      courses: []
    };

    AppState.setCourseFilter = function(allowed) {
      filters.courses = allowed;
    };

    // AppState.data.classes is used to display the class-menu-directive class dropdown
    // and so needs to be updated if the class list is updated.
    // Note: The classes list uses a string course_id, while the bootstrapped courses
    // list has an integer id.
    PubSub.subscribe('StateChange:classes', function(classes) {
        AppState.set('courses', classes);
    });

    // Applying the filter entails checking the filters hash for a filter to apply to the named State.
    // If a filter has been set, the State's array of objects is passed through the javascript
    // filter method, so each element can be compared with the specified filter values.
    AppState.filteredCourses = function(classes) {
      // Filter the AppState courses list--unless a specific list of classes is passed in.
      // This allows the filter to work with the class list just set in CourseHelper, whether
      // or not the asynchronous AppState update has yet occurred.
      var classesToFilter = classes || AppState.data.courses;
      var filteredCourses = _.cloneDeep(classesToFilter);
      if (filters.courses.length > 0) {
        filteredCourses = filteredCourses.filter((item) => {
          return filters.courses.indexOf(item.id) !== -1;
        }).sort(CourseHelper.sorter);

        // Adjust curCourse, to keep the selection within the filtered list.
        if (AppState.data.curCourse === undefined) {
          AppState.data.curCourse = AppState.data.defaultCourse;
        }
        if (filters.courses.indexOf(AppState.data.curCourse.id) === -1) {
          AppState.data.curCourse = filteredCourses[0];
        }
      }
      return filteredCourses;
    };

    // Flag to indicate whether this user has only digital books and not custom ones as well.
    // From Bootstrap.php:
    // ebooks is set if product_line is any of 'ebook', 'conn_gr6', 'collection', 'languagearts'
    // lang is set if product_line is any of 'lang', 'languagearts'
    // pdf is set if product line is any of 'pdf', 'ihdp'
    // custom is set if product line is 'fpp'
    // Therefore, setDigitalBooks returns true IF any books have product_line for ebooks or pdf
    // AND no books have fpp
    // AND no books have lang or languagearts
    // Otherwise, it returns false.
    AppState.setDigitalBooks = function() {
      var ebooksData = AppState.get('ebooksData');
      var flags = ebooksData.bookshelf;
      //var result = (flags.ebooks || flags.pdf) && !flags.custom && !flags.lang;
      var result = (flags.ebooks || flags.pdf || flags.lang) && !flags.custom;
      return result;
    };


    return AppState;

  };
