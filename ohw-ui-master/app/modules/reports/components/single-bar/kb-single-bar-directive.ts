'use strict';

export default function() {
	var template = require('./kb-single-bar.html');
	var popoverTemplate = require('./popover.html');

	var fitThreshold = 33;	// Width, in pixels, required for a bar to display text inside (it would be better to measure the text, but that's harder)

	function link(scope, element, attrs) {
		// Set the width of the bars
		scope.popoverTemplate = popoverTemplate;
		var wid = +element[0].clientWidth;

		var pieces = element.children();

		window.setTimeout(function() {
			pieces.removeClass('singleBarCompress');
		}, 1);

		pieces[0].setAttribute('style', widthStr(scope.model.average, wid));
		scope.modelClass = getRank(scope.model.average, scope.ranges);

		scope.opts = getOptions(scope.options);

		displayVals(scope.model.average, wid, scope);
	}

	function widthStr(percent, width) {
		return 'width: ' +  Math.floor(percent * width) + 'px';
	}

	function getRank(value, ranges) {
		value *= 100;

		if (value >= ranges.excel) {
			return 'singleBarExcel';
		} else if (value >= ranges.pass) {
			return 'singleBarPass';
		}
		return 'singleBarFail';
	}

	function displayVals(percent, width, scope) {
//		var pixels = Math.floor(percent / 100 * width);
		var pixels = Math.floor(percent * width);
		scope.textFits = (pixels >= fitThreshold);
	}

	function getOptions(list) {
		var out = {};

		if (list) {
			_.forEach(list.split(','), function(opt) {
				out[opt] = true;
			});
		}
		return out;
	}

// Directive configuration
	return {
		restrict: 'E',
		scope: {
			model: '=ngModel',
			click: '=',
			ranges: '=',
			options: '@'
		},
		templateUrl: template,
		link: link,
		replace: true
	};

};
