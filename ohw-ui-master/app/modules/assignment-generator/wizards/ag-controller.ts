'use strict';

export default function($rootScope, $scope, $state) {

		var tabs = [
			{
				id: 'ag-details',
				name: 'Details',
				state: 'assignGenApp.details',
				enabled: 'assignGen.edit',
				fullScreen: true,
				disabled: false,
				hide: false,
				active: false
			},
			{
				id: 'ag-roster',
				name: 'Customize',
				state: 'assignGenApp.roster',
				fullScreen: true,
				disabled: true,
				enabled: 'assignGen.edit',
				condition: 'assignGen.detailsValid',
				hide: false,
				active: false
			},
			{
				id: 'ag-select',
				name: 'Questions',
				state: 'assignGenApp.choose',
				fullScreen: true,
				disabled: true,
				enabled: 'assignGen.edit',
				condition: 'assignGen.detailsValid',
				hide: false,
				active: false
			},
			{
				id: 'ag-edit',
				name: 'Edit',
				state: 'assignGenApp.edit',
				fullScreen: true,
				disabled: true,
				enabled: 'assignGen.edit',
				condition: 'assignGen.chooseValid',
				hide: false,
				active: false
			},
			{
				id: 'ag-print',
				name: 'Print',
				state: 'assignGenApp.preview',
				fullScreen: true,
				disabled: true,
				enabled: 'assignGen.edit',
				condition: 'assignGen.printValid',
				hide: false,
				active: false
			}
		];

		var customTabs = {
			'view-problems': { }
		};

		configureTabs();

		$rootScope.$on('AssignmentGenerator:hide-tabs', hideTabs);

		function configureTabs() {
			_.each(tabs, (tab) => {
				tab.active = !!(tab.state === $state.current.name);
				// Checking for customized tabs
				if ($rootScope.assignGen) {
					if ($rootScope.assignGen.customWizardTabs) {
						var custom = customTabs[$rootScope.assignGen.customWizardTabs];
						if (custom[tab.id])
							_.each(custom[tab.id], (val, key) => { tab[key] = val; } );
						tab.hide = !custom[tab.id];
					}
					$rootScope.goToSharedList = ($rootScope.assignGen.customWizardTabs === 'view-problems');
				}
			});

			$scope.wizard = { tabs: tabs };

		}

		function hideTabs() {
			$rootScope.assignGen = {
				readonly: true,
				customWizardTabs: 'view-problems'
			};
			configureTabs();
		}
	};
