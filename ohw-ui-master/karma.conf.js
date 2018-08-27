'use strict';

module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-route.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.3.1/lodash.min.js',

      'https://code.angularjs.org/1.3.15/angular-mocks.js',

      'app/app.js',
      'app/components/**/module.js',
      'app/components/**/*.js'
    ],

	exclude: [
      'app/Deploy/*.js'
	],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
