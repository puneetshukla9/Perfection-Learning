module.exports = function(config){
  config.set({

//    basePath : base,

    files : [
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-route.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min.js',

      'https://code.angularjs.org/1.4.8/angular-mocks.js',

		// Deployed version
      '../DEPLOY/Assignments/app.min.js',

	  // Tests
	  '../shared/libs/**/*_test.js',
	  '../shared/libs/**/**/*_test.js',
    ],

	exclude: [
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

	client: {
//	  captureConsole: false
	},

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
