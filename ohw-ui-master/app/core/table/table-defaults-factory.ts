'use strict';

export default function() {

    var TableDefaults = {};

    TableDefaults.enableHorizontalScrollbar = 0;
    TableDefaults.enableVerticalScrollbar = 2;
    TableDefaults.rowTemplate =
      '<div ng-click="grid.appScope.drill(row.entity)" ' +
      'ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"' +
      'class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>';
    TableDefaults.paginationPageSizes = [25, 50, 75];
    TableDefaults.paginationPageSize = 25;
    TableDefaults.rowHeight = 40;
    TableDefaults.enableGridMenu = false;
    TableDefaults.enableColumnMenus = false;
    TableDefaults.enableRowSelection = false;
    TableDefaults.enablePaginationControls = true;
    TableDefaults.gridMenuCustomItems = [
      {
        title: 'Export:',
        leaveOpen: true,
        action: function() {},
        icon: ''
      }
    ];
    TableDefaults.exporterMenuPdf = false;

	TableDefaults.checkVerticalScroll = function(gridApi, gridOptions, containerHeight) {
		var visibleRows = gridApi.core.getVisibleRows(gridApi.grid);
		if (!containerHeight || !visibleRows) return;
		containerHeight = containerHeight - 50; // accommodate for header, etc.
		if ((containerHeight / TableDefaults.rowHeight) <= visibleRows.length) {
			gridOptions.enableVerticalScrollbar = 1;
		} else {
			gridOptions.enableVerticalScrollbar = 0;
		}
	};

	TableDefaults.checkPagination = function(gridApi, gridOptions) {
		var numPages = gridApi.pagination.getTotalPages();
		var visibleRows = gridApi.core.getVisibleRows(gridApi.grid);
		if (numPages < 2) {
			gridOptions.enablePaginationControls = false;
		} else {
			gridOptions.enablePaginationControls = true;
		}
	};

	// window resized
	TableDefaults.onResize = function(oH, oW, nH, nW) {
		var containerHeight = nH; // ` $('div[ui-grid]').height() - 50; // accommodate header row
		TableDefaults.checkVerticalScroll(this.gridApi, this.gridOptions, containerHeight);
	};

	return TableDefaults;

};
