'use strict';

export default function() {
	var popoverTemplate = require('./popover.html');
	var template = require('./kb-triple-bar.html');
	var threshold = 20;

	function link(scope, element, attrs) {
		// Set the width of the bars
		scope.popoverTemplate = popoverTemplate;
		var wid = +element[0].clientWidth;
//		var ht = +element[0].clientHeight;

		var widList = getWidths(wid, [scope.model.fail, scope.model.pass, scope.model.excel]);

		var pieces = element.children();
		pieces[0].setAttribute('style', widthStr(widList[0]));
		pieces[1].setAttribute('style', widthStr(widList[1]));
		pieces[2].setAttribute('style', widthStr(widList[2]));

		displayVals(widList, scope);
	}

	function getWidths(totalWidth, list) {
		var adjustedTotal = totalWidth - (list.length - 1);	// Remove the border size from the calculations

		var total = _.sum(list) || 1;		// Don't allow division by 0
		var running = 0;

		var out = [];
		for (var i = 0, len = list.length; i < len; i++) {
			if (i !== (list.length - 1)) {
				var w = Math.round(list[i] / total * adjustedTotal) + 1;	// Add 1 to compensate for the border

				// Enter the browser hacks. This is extremely difficult to do in every situation.
				// Hack 1: Values here have 1 subtracted from the bar width to allow for the border. If the width is 0, it doesn't subtract 1.
				if (w === 0)
					w = 1;

				// Hack 2: We're using Math.round above,
				// which works perfectly unless you have two values that end with 0.5. They are both rounded up and we're 1 pixel too wide.
				if (running + w > totalWidth) {
					w = totalWidth - running;
				}
				running += w;
				out.push(w);
			} else {
				if (_.sum(list) === 0) { // Handle case in which fail, pass, and excel all have 0 items. Make bar "fail" color.
					out.push(w);
				  out[0] = totalWidth - running;
				} else {
					out.push(totalWidth - running);		// Overcome rounding errors by using up all remaining space
				}
			}
		}

		return out;
	}

	function widthStr(width) {
		return 'width:' +  width + 'px';
	}

	function displayVals(widthList, scope) {
		var dispList = [
			{model: 'fail', field: 'showFail'},
			{model: 'pass', field: 'showPass'},
			{model: 'excel', field: 'showExcel'}
		];

		for (var i = 0, len = dispList.length; i < len; i++) {
			var pixels = widthList[i];
			scope[dispList[i].field] = (pixels >= threshold);
		}
	}

// Directive configuration
	return {
		restrict: 'E',
		scope: {
			model: '=ngModel',
			click: '='
		},
		templateUrl: template,
		link: link,
		replace: true
	};

};
