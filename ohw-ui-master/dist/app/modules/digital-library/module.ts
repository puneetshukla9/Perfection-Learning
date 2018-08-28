'use strict';

import 'angular-ui-router';
import 'angular-ui-bootstrap';

import './components/bookshelf/module.ts';
import './components/wizards/module.ts';

import './less/master.less';

export default angular.module('digitalLibrary', [
	'digitalLibrary.bookshelf',
	'digitalLibrary.wizards'
])
.config(function($qProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
	$qProvider.errorOnUnhandledRejections(false);

	$stateProvider

		.state('libraryApp', {
			url: '/digital-library',
			templateUrl: require('./app.html')
		})

		.state('libraryApp.bookshelf', {
			url: '/bookshelf-wizard',
			templateUrl: require('./components/wizards/manage-bookshelf/manage-bookshelf.html'),
			controller: 'ManageBookshelfCtrl'
		})

		.state('libraryApp.bookshelf.userBookshelf', {
			templateUrl: require('./components/bookshelf/user-bookshelf.html'),
			url: '/bookshelf',
			controller: 'UserBookshelfCtrl as ctrl'
		})
/*
		.state('libraryApp.bookshelf.bookRead', {
			url: '/read/:bookId',
			params: { bookId: null },
			templateUrl: require('./components/bookshelf/book-read.html'),
			controller: 'BookReadCtrl as ctrl'
		})
*/
		.state('libraryApp.bookRead', {
			url: '/read/:bookId',
			params: { bookId: null },
			templateUrl: require('./components/bookshelf/book-read.html'),
			controller: 'BookReadCtrl as ctrl'
		});
});
