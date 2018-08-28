'use strict';

export default function($scope, $state) {
    $scope.wizard = {};

    var tabs = [
      { id: 'bookshelf',
        name: 'Bookshelf',
        state: 'libraryApp.bookshelf.userBookshelf',
        enabled: 'libraryApp.bookshelf',
        fullScreen: true,
        disabled: false,
        active: true },
      { id: 'bookread',
        name: 'Read Book',
        state: 'libraryApp.bookshelf.bookRead',
        disabled: false,
        enabled: 'libraryApp.bookshelf',
        require: 'bookshelf',
        fullWindow: true,
        active: false }
    ];

    /*
      Not sure why, declaring tabs locally and then calling configureTabs to add the tabs array to
      $scope.wizard seems important in getting Read Book to be loadable on its own--that is, to not
      revert to the bookshelf on refresh. This is important for getting it to open in its own tab.

      Something else we tried was adding a bookshelf wizard tag in index.template.html. Turns out that
      this didn't contribute to having the bookread tab open independently. We removed it, to get rid of
      the tabs.
     */
    configureTabs();

    function configureTabs() {
			_.each(tabs, (tab) => {
				tab.active = !!(tab.state === $state.current.name);
			});

			$scope.wizard = { tabs: tabs };

		}


};
