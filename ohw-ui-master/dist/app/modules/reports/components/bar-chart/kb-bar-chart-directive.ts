'use strict';

export default function($location, $window, $filter) {
	var template = require('./kb-bar-chart.html');
	var margin = {top: 20, right: 20, bottom: 30, left: 160};		// 80
	var yWidthTweak = 0;
	var widthAdjust = 2 + yWidthTweak;
	var widthDelta;
	var height, width;

	var barTextCutoff = 0.16;	// CONSTANT -- Grades at or below this value will be shown to the right of the bar rather than inside
	var data, ranges;			// PASSED IN
	var avg;

	var absUrl;
	var scope;
	var natSortFilter = $filter('NatSort');

	function calcHeight(el) {
		var _h = elHeight(el[0]) - margin.top - margin.bottom;
		//var _h = scope.data.length * 50 - margin.top - margin.bottom;
		return _h;
	}

	function link(sc, element, attrs) {
		scope = sc;
		window.setTimeout(function() {continueLink(element, attrs); }, 0);
	}

	// The first time through, clientWidth isn't accurate.
	// Wait a moment before doing important size-based calculations.
	function continueLink(element, attrs) {
		// Calculated sizes
		margin.left = +scope.leftMargin;

	  height = calcHeight(element);
		var w = elWidth(element[0]);
		width = w - widthAdjust - margin.left - margin.right;	// -2 is slight safety margin. I was getting scrollbars sometimes.
		widthDelta = elWidth(element[0].parentNode) - w;
			// Later, we set the size based on the parent container. However, we have to adjust for padding on the parent.

		// We need a URL for filters to work (it's a lousy system!)
		absUrl = $location.absUrl();

		// Passed-in data
		ranges = scope.ranges;
		data = natSortFilter(scope.data, 'entry');
		var def;

		// Watch for data changes, and redraw the graph as needed.
		scope.$watchCollection('data', function(newData, oldData) {
			if (_.isEqual(newData, oldData))
				return;

			data = natSortFilter(scope.data, 'entry');
			removeResizeHandler();
			element.html('');		// Wipe out any existing chart

			def = createChart(element);
			sizeHandler(element, def);
		});

		// Initial creation
		def = createChart(element);

		// Install a resize handler
		sizeHandler(element, def);
	}

	function createChart(element) {
		// Calculate the average of our data
		var dataSum = d3.sum(data, function(d) { return d.value; });
		avg = dataSum / data.length;
		height = calcHeight(element);

		// Calculate scaling based on dimensions
		var x = d3.scale.linear()
			.range([0, width]);
		x.domain([0, 1]);

		var y = d3.scale.ordinal()
			.rangeRoundBands([0, height], 0.25);		// This constant controls the bar size (1 - this = % of space used)
		y.domain(data.map(function(d) { return d.entry; }));

		// Create element
		var svg = createContainer();

		// Define dropshadow
//		dropShadow(svg);

		// Add axes and grid
		var axis = setAxis(svg, x, y);
		var grid = setGrid(svg, x, y);

		// Include an average line
		averageLine(svg, x, y);

		// Add bars
		bars(svg, x, y);

		// Add bar text
		barText(svg, x, y);

		barAnim(svg);

		return {svg: svg, x: x, y: y, axis: axis, grid: grid};
	}

	function createContainer() {
		var w = width + margin.left + margin.right;
		var h = height + margin.top + margin.bottom;

		return d3.select('svg.kbchart')
			.attr('width', w)
			.attr('height', h)

			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	}

	function setAxis(svg, x, y) {
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient('bottom')
			.ticks(5, '%');

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient('left');

		// Axis
		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(' + yWidthTweak + ',' + height + ')')
			.call(xAxis);

		svg.append('g')
			.attr('class', 'y axis')
			.attr('transform', 'translate(' + yWidthTweak + ', 0)')
			.call(yAxis);
//			.selectAll('.tick text')
//			.call(wrap, margin.left);


		svg.selectAll('.y>.tick').on('click', tickClick);

		return [xAxis, yAxis];
	}

	function setGrid(svg, x, y) {
		var xGrid = d3.svg.axis()
			.scale(x)
			.orient('bottom')
			.ticks(10)
			.tickSize(-height, 0, 0)
			.tickFormat('');
/*
		var yGrid = d3.svg.axis()
			.scale(y)
			.orient('left')
			.ticks(5)
			.tickSize(-width, 0, 0)
			.tickFormat('');
*/
		// Grid
		svg.append('g')
			.attr('class', 'grid')
			.attr('transform', 'translate(' + yWidthTweak + ',' + height + ')')
			.call(xGrid);
		return xGrid;
	}

	function averageLine(svg, x, y) {
		var xPos = x(avg);
		xPos += yWidthTweak;
		svg.append('line')
			.attr('class', 'avg_line')
			.attr('x1', xPos)
			.attr('y1', 0)
			.attr('x2', xPos)
			.attr('y2', height);
	}

	function bars(svg, x, y) {
		var group = svg.selectAll('#fake')		// This is clearly wrong, returning an empty selection. There must be a better way to get the correct node!
			.data(data)
			.enter().append('g')
				.on('click', barClick)
				.attr('class', function(d) {return 'barGroup ' + getRank(d.value); });

		group.append('rect')
			.attr('class', 'kbc_bar_container')
			.attr('x', function(d) { return 1 + yWidthTweak; })					// Shift right by 1 pixel so the axis line isn't covered up
			.attr('width', function(d) { return x(1) - 1; })	// Shift right by 1 pixel so the axis line isn't covered up
			.attr('y', function(d) { return y(d.entry); })
			.attr('height', y.rangeBand())
			.attr('rx', 7);

		group.append('rect')
			.attr('class', 'kbc_bar')
			.attr('x', function(d) { return 1 + yWidthTweak; })					// Shift right by 1 pixel so the axis line isn't covered up
			.attr('width', function(d) { return (x(d.value) >= 1) ? x(d.value) - 1 : 0; })	// Shift right by 1 pixel so the axis line isn't covered up
			.attr('y', function(d) { return y(d.entry); })
			.attr('height', y.rangeBand())
			.attr('rx', 7);
//			.style('filter', 'url(' + absUrl + '#drop-shadow)')
	}

	// Text in bars
	function barText(svg, x, y) {
		svg.selectAll('.barGroup')
			.append('text')
				.attr('class', function(d) {
					if (d.value >= barTextCutoff)
						return 'barLabel';
					return 'barLabelRight';
				})
				.attr('x', function(d) { return barTextPos(x, d.value); })
				.attr('y', function(d) { return y(d.entry) + y.rangeBand() / 2; })
				.attr('dy', '.35em')
				.text(function(d) { return Math.round(d.value * 100) + '%'; });
	}

	// Hover handler
	function barAnim(svg) {
		return;
	}

	function getRank(value) {
		value *= 100;
		if (value >= ranges.excel) {
			return 'excel';
		} else if (value >= ranges.pass) {
			return 'pass';
		}
		return 'fail';
	}

	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr('y'),
				dy = parseFloat(text.attr('dy')),
				tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

			word = words.pop();
			while (word) {
				line.push(word);
				tspan.text(line.join(' '));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(' '));
					line = [word];
					tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
				}
				word = words.pop();
			}
		});
	}

	function sizeHandler(element, def) {
		// def.svg, def.x, def.y, def.axis, def.grid
		var w = angular.element($window);
		w.bind('resize', function () {

			width = elWidth(element[0].parentNode) - widthDelta - widthAdjust - margin.left - margin.right;
				// -2 is slight safety margin. I was getting scrollbars sometimes.
			height = calcHeight(element);

			// Reset x and y ranges
			def.x.range([0, width]);
			def.y.rangeRoundBands([0, height], 0.25);		// This constant controls the bar size (1 - this = % of space used)

			// Container
			d3.select(def.svg.node().parentNode)
				.attr('height', (def.y.rangeExtent()[1] + margin.top + margin.bottom))
				.attr('width', (width + margin.left + margin.right));

			// Bars
			def.svg.selectAll('.kbc_bar')
				.attr('width', function(d) { return (def.x(d.value) >= 1) ? def.x(d.value) - 1 : 0; })
				.attr('y', function(d) { return def.y(d.entry); })
				.attr('height', def.y.rangeBand());

			def.svg.selectAll('.kbc_bar_container')
				.attr('width', function(d) { return def.x(1) - yWidthTweak; })
				.attr('y', function(d) { return def.y(d.entry); })
				.attr('height', def.y.rangeBand());

			def.svg.selectAll('.barGroup>text')
				.attr('x', function(d) { return barTextPos(def.x, d.value); })
				.attr('y', function(d) { return def.y(d.entry) + def.y.rangeBand() / 2; });

			// Average line
			def.svg.selectAll('.avg_line')
				.attr('x1', def.x(avg))
				.attr('x2', def.x(avg))
//r				.attr('y1', 0)
				.attr('y2', height);

			// Update axes
			def.svg.select('.x.axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(def.axis[0].orient('bottom'));

			def.svg.select('.y.axis').call(def.axis[1].orient('left'));

		var xGrid = d3.svg.axis()
			.scale(def.x)
			.orient('bottom')
			.ticks(10)
			.tickSize(-height, 0, 0)
			.tickFormat('');

			def.svg.select('.grid')
				.call(xGrid)
				.attr('transform', 'translate(0,' + height + ')')
				.call(def.grid.orient('bottom'));

		});

		// When this directive is destroyed, be sure to unbind the event handler
		scope.$on('$destroy', function() {
			removeResizeHandler();
		});
	}

	function removeResizeHandler() {
		var w = angular.element($window);
		w.unbind('resize');
	}

	// Calculates text position of bar text
	function barTextPos(x, val) {
		var xPos = x(val);
		xPos += yWidthTweak;
		// If there's room, go inside the bar
		if (val >= barTextCutoff)
			return xPos - 5;

		// Failing that, position to the right
		return xPos + 7;
	}

	function tickClick(label, idx) {
		if (scope.click) scope.click(data[idx].id);
		scope.$apply();
	}

	// One of the bars was clicked on. Perform the requested
	// action.
	function barClick(obj, idx) {
		if (scope.click) scope.click(obj.id);
		scope.$apply();
	}

	// Cross-browser element width for <svg> elements
	//
	// All browsers but Firefox work with clientWidth/clientHeight.
	// Firefox has a long-standing bug that doesn't appear like
	// it will be fixed anytime soon:
	// https://bugzilla.mozilla.org/show_bug.cgi?id=874811
	function elWidth(el) {
		return el.clientWidth || Math.round(el.getBoundingClientRect().width);
	}

	// Cross-browser element height for <svg> elements
	function elHeight(el) {
		var dataHeight = (el.parentNode.dataset.height);
		el.parentNode.style.height = dataHeight;
		el.style.height = (el.parentNode.clientHeight) + 'px';
		return el.clientHeight || Math.round(el.getBoundingClientRect().height);
	}

// Directive configuration
	return {
		restrict: 'E',
		scope: {
			data: '=ngModel',
			ranges: '=',
			click: '=',
			leftMargin: '@',
			height: '@'
		},
//		controller: 'barChartCtrl as ctrl',
		templateUrl: template,
		link: link,
		replace: true
	};
};
