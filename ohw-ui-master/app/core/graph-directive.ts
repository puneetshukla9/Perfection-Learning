'use strict';

/* tslint:disable */

// Angular Directive For KB Math Graphs
//
// PARAMS:
//   width, height: in pixels
//   eqs: Array of equations (strings) to draw
//   axis: {x:[min,max,step], y:[min,max,step], skip: Int(def:1), usePiLabels: Boolean}
//
// Version 1.0. August 18th, 2014

export default function($document) {

	var self;

	var defaults = {

		width: 200,
		height: 200,

		eqs: [],
		axis: {
			x: [-100, 100, 10],
			y: [-100, 100, 10],
			skip: 1,
			usePiLabels: false
		}
	}


	// Outer template. Since we have variables, we have to create it manually rather
	// than just returning it.

	var template = '<canvas></canvas>';


	// Global variables. These should almost certainly be members instead, but as long
	// as the plugin isn't interactive it shouldn't matter.


	// graph
	var _xMax_lgc, _xMin_lgc, _xStep_lgc, xUpperBound, xLowerBound;
	var _yMax_lgc, _yMin_lgc, _yStep_lgc, yUpperBound, yLowerBound;
	var _aryEq;
	var ctx;

	// graphGrid
	var Pi = '\u03c0';   //'&#960';
	var _negSignW = 2; // pixels

	var opts;
	var _xGrid, _yGrid;

	var style = {
		pointColor: 'red',
		pointTextColor: 'darkgreen',
		bgColor: 'white',
		gridColor: 'lightgray',
		axisColor: 'black',
		gridFont: "12px serif",
		gridFontColor: '#707070' // light gray
	};


	//

	function link(scope, element, attrs)
	{
		self = scope;

		scope.settings = _.extend({}, defaults, scope.options);

		// Add in answer points if they were supplied
		if (scope.answer)
			addAnswers(scope.answer);

		// Create the canvas element.
		element.html(template);
		scope.canvas = angular.element(element.children()[0]);

		scope.canvas.attr({
			'class': 'kbGraph',
			width: scope.settings.width,
			height: scope.settings.height
		});

		// Fill in the equations
		draw(scope.canvas);
	}


	//

	function addAnswers(ans)
	{
		var parsed = parseGraphPoints(ans);

		self.settings.eqs = self.settings.eqs.concat(parsed);
	}


	// parseGraphPoints

	function parseGraphPoints(strPoints)
	{
		var points = strPoints.split(",");
		var pointCount = points.length;

		var eq = [];
		for (var i = 0; i < pointCount; i+=2)
			eq.push("point=" + points[i] + "," + points[i+1]);

		return eq;
	}


// Directive configuration

	return {
		restrict: 'E',
		scope: {
			options: '=options',
			answer: '=kbAnswer'
		},

		link: link
	};



// Private methods



// EQUATIONS AND GENERAL DRAWING


	/*************************************************************************
	 This is the main function of the graph object
	 Input:
		_aryEq - arry of equations to draw
	*************************************************************************/
	function draw(canvas)
	{
		var eq = self.settings.eqs;

		// Equations are optional. Sometimes we just want to display an empty grid.
//		if (eq.length < 1)
//			return;

		_aryEq = eq.slice(0);		// Clone

		setAxis(canvas);
		gridDraw();
		drawEquations();
	}



	function setAxis(canvas)
	{
		var parms = self.settings.axis;

		// Set some default values if they are missing
		if (typeof parms.x === 'undefined')
			parms.x = [-10, 10, 1];
		if (typeof parms.y === 'undefined')
			parms.y = [-10, 10, 1];
		if (typeof parms.skip === 'undefined')
			parms.skip = 1;

		if (typeof parms.x === 'string')
			parms.x = parms.x.split(',');
		if (typeof parms.y === 'string')
			parms.y = parms.y.split(',');

		// Get the 2D context
		ctx = canvas[0].getContext("2d");

		gridCreate({
			xRange: parms.x,
			yRange: parms.y,
			labelSkip: parms.skip,
			usePiLabels: !!parms.usePiLabels
		});

		// index values for xRange, yRange to replace the magic numbers:
		var minIdx = 0, maxIdx = 1, StepSize = 2;

		_xMax_lgc = parms.x[maxIdx];
		_xMin_lgc = parms.x[minIdx];
		_xStep_lgc = parms.x[StepSize];

		_yMax_lgc = parms.y[maxIdx];
		_yMin_lgc = parms.y[minIdx];
		_yStep_lgc = parms.y[StepSize];

		var clearanceFactor = 1.2;
		xUpperBound = _xMax_lgc * clearanceFactor; // make sure the graph draws to the border
		xLowerBound = _xMin_lgc * clearanceFactor; // make sure the graph draws to the border
		yUpperBound = _yMax_lgc * clearanceFactor; // make sure the graph draws to the border
		yLowerBound = _yMin_lgc * clearanceFactor; // make sure the graph draws to the border
	}

	// draw equations
	function appendColorFn(arg, color, drawFn)
	{
		drawFn.apply(this, arg.concat(color));
	}



	function initConicFn(arg, color)
	{
		arg.unshift(color); // Add elements at beginning of args array
		return initConics.apply(this, arg);
	}


	// set transform matrix to identity

	function setTransformToIdentity(canvasContext)
	{
		canvasContext.setTransform(1, 0, 0, 1, 0, 0);
	}



	function drawEquations(newEq)
	{
		var drawAry;

		if (newEq)  drawAry = newEq;
		else
		{
			if (!_aryEq || _aryEq.length == 0)  return;
			drawAry = _aryEq;
		}

		setTransformToIdentity(ctx);

		var strEq, colorEq, eqType, args, option;

		// parameter setup for graphics rendering
		var eq = {
			log: { nParam:4,   fn: function(arg, color){ appendColorFn(arg, color, drawLogEqn) } },// 'logarithm',

			exponent: { nParam:4,   fn: function(arg, color){ appendColorFn(arg, color, drawExpEqn) } },// 'exponent',

			radical: { nParam:4,   fn: function(arg, color){ appendColorFn(arg, color, drawRadEqn) } },// 'radical',

			rational: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawRatEqn) } },// 'rational',

			sin: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawSinEqn) } },// 'sine',

			cos: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawCosEqn) } },// 'cosine',

			tan: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawTanEqn) } },// 'tangent',

			parabolastd: { nParam:3, fn: function(arg, color){ appendColorFn(arg, color, drawQuadSEqn) } },// 'quadratic (Standard)',

//			quadv: { nParam:3, fn: function(arg, color){ appendColorFn(arg, color, drawQuadVEqn) } },// 'quadratic (Vertex)',

			line: { nParam:2,  fn: function(arg, color){ appendColorFn(arg, color, drawLineEqn) } },// 'line',

			circle:{ nParam:3, fn: function(arg, color){ appendColorFn(arg, color, drawCircle) } }, // 'circle',


			parabolax2: { nParam:3,   fn: function (arg, color)                              // 'parabolax2',
					{   var cnc = initConicFn(arg, color);

						// parabolaX2 h,k,p -- using formula 4p(y-k)=(x-h)^2
						// after translate to (h, k): y = +- x^2 / 4p
						cnc.bDrawPositiveY = false;
						cnc.Eq = function(x, p) { return x*x / (4*p); }

						var p = arg[3], h = arg[1]; // color, h, k, a, b
						var xMaxY_lgc = Math.sqrt(4 * p * _yMax_lgc); // since 4py = x^2
						cnc.xStart = 0;
						cnc.dX = -cnc.dX; // make it positive
						cnc.xCompare = function(x, h) { return x >=0 && x <= xUpperBound + Math.abs(h); }

						arg.unshift(cnc);	// stuff extra param at beginning of arg

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, p) { return (Math.sqrt(4*p*y)); }
						cnc.yStart = 0;
						if (p < 0)
							cnc.yCompare = function(y, k) { return y <= 0 && y >= yLowerBound - Math.abs(k);  }
						else
						{
							cnc.dY = -cnc.dY; // make it positive
							cnc.yCompare = function(y, k) { return y >= 0 && y <= yUpperBound + Math.abs(k); }
						}

						drawConics.apply(this, arg);
					}
				},


			parabolay2: { nParam:3,   fn: function (arg, color)                              // 'parabolay2',
					{   var cnc = initConicFn(arg, color);

						// parabolaY2 h,k,p -- using formula 4p(x-h)=(y-k)^2
						// after translate to (h, k): y = +- sqrt(4px)
						cnc.bDrawNegativeX = false;

						var a = arg[3]; // color, h, k, a, b
						var Sign = mathSign(a); // sign of a
						cnc.xStart *= Sign;
						cnc.dX *= Sign; // keep going forever with this condition??
						if (Sign < 0)
						{
							cnc.xCompare = function(x) { return x <= cnc.xVertex; };
							cnc.yCompare = function(y, k) { return y >= 0 && y <= yUpperBound + Math.abs(k); }
						}

						cnc.Eq = function(x, a) { return 2 * Math.sqrt( a * x ); }
						arg.unshift(cnc);	// stuff extra param at beginning of arg

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, p) { return (y*y/(4*p)); }
						cnc.yStart *= Sign;

						drawConics.apply(this, arg); }
					},


			ellipse: { nParam:4,   fn: function (arg, color)                              // 'ellipse',
					{   var cnc = initConicFn(arg, color);
						var a = arg[3], b = arg[4]; // color, h, k, a, b
						cnc.xVertex = a;
						cnc.xVertexPx = gridXLgcLengthToPx(a);
						cnc.yVertex = b;
						cnc.yVertexPx = gridYLgcLengthToPx(b);
						cnc.xStart = 0;

						if (a < 0)
						{
							cnc.xCompare = function(x, h, a)
										{ return x >= Math.max(a, xLowerBound-Math.abs(h)); };
						}
						else
						{
							cnc.dX = -cnc.dX; // make it positive
							cnc.xCompare = function(x, h, a)
										{ return x <= Math.min(a, xUpperBound+Math.abs(h)); };
						}

						/**********************************************************************
							Draw an ellipse in the equation of (x-h)^2/a^2 + (y-k)^2/b^2 = 1;
							if h, k are zeros (we translate the system origin to h,k),
							the resulting equation will be     x^2/a^2 + y^2/b^2 = 1;

							therefore:   y = +- sqrt(1 - x^2/a^2) * b
						 **********************************************************************/
						cnc.Eq = function(x, a, b) { return b * Math.sqrt( 1 - x*x / (a*a) ); }

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, a, b) { return a* Math.sqrt(1 - y*y/(b*b)); }

						if (b<0) {
							cnc.dY = -cnc.dY; // make it positive
							cnc.yCompare = function(y, k, b)
										{ return y < 0 && y >= Math.min(b, yLowerBound-Math.abs(k)); }
						}
						else
							cnc.yCompare = function(y, k, b)
										{ return y > 0 && y <= Math.min(b, yUpperBound+Math.abs(k)); }

						arg.unshift(cnc);	// stuff extra param at beginning of arg
						drawConics.apply(this, arg); }
					},


			hyperbolaxpos: { nParam:4,   fn: function (arg, color)                           // 'hyperbolaxpos',
					{   var cnc = initConicFn(arg, color);
						var a = arg[3], b = arg[4]; // color, h, k, a, b
						cnc.xVertex = a;
						cnc.xVertexPx = gridXLgcLengthToPx(a);
						cnc.yVertex = b;
						cnc.yVertexPx = gridYLgcLengthToPx(b);

						cnc.xCompare = function(x, h, a) { return x >=a; }// && x <= xUpperBound; }

						// (x-h)^2/a^2 - (y-k)^2/b^2 = 1
						cnc.Eq = function(x, a, b) { return b * Math.sqrt( x*x / (a*a) - 1); }

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, a, b) { return (a* Math.sqrt(1 + y*y/(b*b))); }

						if (b < 0)
						{
							cnc.dY = -cnc.dY; // make it positive
							cnc.yCompare = function(y) { return y <= 0;  }
						}
						else
							cnc.yCompare = function(y) { return y >= 0; }// && y <= yUpperBound; }

						arg.unshift(cnc);	// stuff extra param at beginning of arg
						drawConics.apply(this, arg); }
					},


			hyperbolaypos: { nParam:4,   fn: function (arg, color)                            // 'hyperbolaypos',
					{   var cnc = initConicFn(arg, color);
						var a = arg[3], b = arg[4]; // color, h, k, a, b

						// (y-k)^2/b^2 - (x-h)^2/a^2 = 1
						cnc.Eq = function(x, a, b) { return b * Math.sqrt( x*x / (a*a) + 1); }

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, a, b) { return (a* Math.sqrt(y*y/(b*b)-1)); }
						if (a < 0)
						{
							cnc.dX = -cnc.dX; // make it positive
							cnc.xStart = -cnc.xStart;
							cnc.xCompare = function(x) { return x <= 0;  }
						}

						if (b < 0)
							cnc.dY = -cnc.dY; // make it positive

						cnc.yCompare = function(y, k, b) { return Math.abs(y) >= Math.abs(b); }// && y <= yUpperBound; }

						arg.unshift(cnc);	// stuff extra param at beginning of arg
						drawConics.apply(this, arg); }
					},

			point: { nParam:2,   fn: function(arg, color, option)
						{   arg.unshift(color, option); // stuff extra param at beginning,
													// since label in the arg is an optional param
							drawDotEq.apply(this, arg); } }
		};


		for (var i=0; i < drawAry.length; i++)
		{
			strEq = drawAry[i];
			colorEq = drawAry[i].color || 'black';
			option = drawAry[i].option;

			// parse the parameters:
			strEq = strEq.replace(/\s*/g, "").toLowerCase();
			eqType = strEq.slice(0, strEq.indexOf('='));
			args = strEq.slice(strEq.indexOf('=')+1).split(','); //.concat(colorEq);

			// build parameters and then draw the equation:
			if ( typeof eq[eqType] !== 'undefined' )
			{
				// parse the parameters for current equation:
				for (var j=0; j < eq[eqType].nParam; j++) // string to number:
					if ( isNaN( args[j] = parseFloat(args[j]) ) )
						args[j] = 0;
						//console.log(eqType + " equation parameter has to be a number!");

				if (args.length >= eq[eqType].nParam)
				   eq[eqType].fn(args, colorEq, option);
				else
					continue;
					//console.log(eqType + " equation does not have right number of parameters!");
			}
			else
				console.log('Attempting to graph unknown type: ' + eqType);
		}
	}

	/************************************************************************************
	  Draw a straight line.
	  Input:
		x1, y1  - start point in pixel unit
		x2, y2  - end point in pixel unit
		width   - line width in pixel unit
		color   - line color
	************************************************************************************/
	function drawLine(x1, y1, x2, y2, width, color)
	{
		x1 = Math.round(x1);
		y1 = Math.round(y1);
		x2 = Math.round(x2);
		y2 = Math.round(y2);

		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();

		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);

		ctx.stroke();
		ctx.closePath();
	}

	/************************************************************************************
	************************************************************************************/
	function drawDotEq(color, option, x, y, label)
	{
		//pt_px = gridLgcPtToCanvasPt(x, y);
		gridDrawMouseLgcPt({x:x, y:y}, '', option, label);
	}

	/************************************************************************************
	  Take the input degree and return the translated radians.
	************************************************************************************/
	function degToRadian(deg)
	{
		return deg * Math.PI / 180;
	}

	/************************************************************************************
	  x, y             - position of the local object coordinates in pixel unit to
						 translate system origin to before rotation.
	  directionDegree  - rotation in degrees
	************************************************************************************/
	function transform(x, y, rotateDeg)
	{
		var directionInRad = degToRadian(rotateDeg);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// translate rotation center to the tip position:
		ctx.translate(x, y);
		ctx.rotate(directionInRad);
	}

	/************************************************************************************
	  x, y             - position of the arrow tip in pixel unit
	  directionDegree  - direction in degrees where the arrow points to
						 zero degree - arrow points to the right
	  length           - length of the arrow along the opposite direction of arrow tip
	************************************************************************************/
	function drawArrow(x, y, directionDegree, length, color)
	{
		var arrowSlentDegree = 5;
		var width = length * Math.tan(degToRadian(arrowSlentDegree));

		transform(x, y, directionDegree);

		// pretend the rotation degree is zero so we draw an arrow points to the right,
		// the trasform call above will take care the rotation effect.
		// since the screen origin has been translated to the tip of the arraw,
		// we need to use the local coordinate instead of original x,y:
		//
		drawLine(0, 0, -length, +width, 2, color);
		drawLine(0, 0, -length, -width, 2, color);
	}



	function drawDot(x, y, size)
	{
		ctx.fillRect(x-size/2, y-size/2, size, size);
	}



	function drawLineEqn(slope_lgc, intersect_lgc, color)
	{
		var ptScn1, ptScn2,
			x1 = xLowerBound,
			x2 = xUpperBound;

		var y1 = (x1 * slope_lgc + intersect_lgc),
			y2 = (x2 * slope_lgc + intersect_lgc);

		ptScn1 = gridLgcPtToCanvasPt(x1, y1);
		ptScn2 = gridLgcPtToCanvasPt(x2, y2);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
	}


	// calculate y-value of exponential function at a given x-value
	// a: base of exponent
	// b: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	// x: x-value to calculate value at

	function exponent(a,b,h,k,x)
	{
		if( (a == 0) && (x == 0) )
		{
			return Number.NaN;
		}
		else
		{
			return b * Math.pow(a,x-h)+k;
		}
	}


	// draw an exponential function
	// a: base of exponent
	// b: coefficient of exponent term
	// h: horizontal shift
	// k: vertical shift

	function drawExpEqn(a, b, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of exponential function
			var y = exponent(a,b,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}


	// calculate y-value of logarithm function at a given x-value
	// a: vertical scaling factor
	// b: base of logarithm
	// h: horizontal shift
	// k: vertical shift
	// x: x-value to calculate value at

	function logarithm(a, b, h, k, x)
	{
	  if(x-h <= 0)
	  {
	    return -Infinity;
	  }
	  else if( (b <= 0) || (b == 1) )
	  {
	    return Number.NaN;
	  }
	  else
	  {
	    var y;
	    y = Math.log(x-h)/Math.log(b);
	    y *= a;
	    y += k;
	    return y;
	  }
    }


    // draw a logarithmic function
	// a: vertical scaling factor
	// b: base of logarithm
	// h: horizontal shift
	// k: vertical shift

	function drawLogEqn(a, b, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound, // logical maximum x-value
			prevX = 0, prevY = 0;

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		//for(var x = x1; x < x2; x += pixelDist)
		for(var x = h; x < x2; x += pixelDist)
		{
			// determine value of log function
			var y = logarithm(a,b,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				if(prevY == -Infinity)
				{
					if(a>0)
					{
						ptScn1 = gridLgcPtToCanvasPt(x, yLowerBound);
					}
					else
					{
						ptScn1 = gridLgcPtToCanvasPt(x, yUpperBound);
					}
				}
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			prevX = x;
			prevY = y;
		}
	}


	// calculate y-value of radical function at a given x-value
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	// n: degree of the root
	// x: x-value to calculate value at

	function radical(a,h,k,n,x)
	{
		// I think we only want to allow integers for the degree of the root.
		// Consider removing this check if it degrades performance too much.
		if(n % 1 != 0)
		{
			return Number.NaN;
		}

		// determine the value of the radicand so as to avoid having multiple subtractions in this function
		var radicand = x-h;

		// if the degree of the root is even:
		if(n % 2 == 0)
		{
			// negative numbers do not have real roots of even degree
			if(radicand < 0)
			{
				return Number.NaN;
			}

			// raising a number to the 1/nth power is the same as taking the nth root of that number
			else
			{
				return a*Math.pow(radicand,1/n)+k;
			}
		}

		// if the degree of the root is odd:
		else
		{
			if(n % 2 == 0)
			{
				Console.log('Something went wrong.');
			}
			// there is a bug in the Math.pow() function where it does not return the correct answer when
			// raising a negative number to a fractional power.
			var factor = (radicand < 0) ? -1 : 1;

			return factor*a*Math.pow(factor*radicand,1/n)+k;
		}
	}


	// draw a radical function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	// n: degree of the root

	function drawRadEqn(a, h, k, n, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
		    ptScn0 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// if n is even, start graphing at h instead of the left edge of the grid
		if(n%2 == 0)
		{
			x1 = h;
		}

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of radical function
			var y = radical(a,h,k,n,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
			}

			// if this is not the first point:
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}


	// calculate y-value of rational function at a given x-value
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function rational(a, h, k, x)
	{
		if(x == h)
		{
			return Number.NaN;
		}
		else
		{
			return a/(x-h)+k;
		}
	}


	// draw a rational function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function drawRatEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value
			var topPt;
			var botPt;
			var prevX=0;
			var prevY=0;

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of radical function
			var y = rational(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
			}

			// otherwise, set ptScn1 to the old point, and set ptScn2 to the new point
			else
			{
				ptScn1 = ptScn2;
			}
			ptScn2 = gridLgcPtToCanvasPt(x, y);

			// if they are on opposite sides of the asymptote,
			// draw lines to the edge of the canvase as appropriate
			if( (x >= h) && (prevX <= h) )
			{
				// if a is positive, draw a line from the last point on the first arm to the bottom of the grid,
 				// and a line from the top of the grid to the first point on the second arm
 				if(a > 0)
 				{
					ptScn2 = gridLgcPtToCanvasPt(x, y);
					botPt = gridLgcPtToCanvasPt(prevX, yLowerBound);
 					drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, color);

 					topPt = gridLgcPtToCanvasPt(x, yUpperBound);
 					drawLine(topPt.x, topPt.y, ptScn2.x, ptScn2.y, color);
 				}

 				// if a is negative, draw a line from the last point on the first arm to the top of the grid,
 				// and a line from the bottom of the grid to the first point on the second arm
 				else
 				{
					ptScn2 = gridLgcPtToCanvasPt(x, y);
 					var topPt = gridLgcPtToCanvasPt(prevX, yUpperBound);
 					drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, color);

 					var botPt = gridLgcPtToCanvasPt(x, yLowerBound);
 					drawLine(botPt.x, botPt.y, ptScn2.x, ptScn2.y, color);
				}
			}

			// if the new point is off the canvas, and the old point is on the canvas,
			// draw a vertical line from the old point to the appropriate canvas edge.
			else if( (prevY < yUpperBound) &&
				(prevY > yLowerBound) &&
				(y > yUpperBound) )
			{
				topPt = gridLgcPtToCanvasPt(prevX, yUpperBound);
				drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, 1, color); //that.graphColor);
			}
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yLowerBound) )
			{
				botPt = gridLgcPtToCanvasPt(prevX, yLowerBound);
				drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, 1, color); //that.graphColor);
			}

			// if the new point is on the canvas, and the old point is off the canvas,
			// draw a vertical line from the appropriate canvas edge to the new point.
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY < yLowerBound) )
			{
				ptScn1 = gridLgcPtToCanvasPt(x, yLowerBound);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY > yUpperBound) )
			{
				ptScn1 = gridLgcPtToCanvasPt(x, yUpperBound);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}

			// if both points are on the canvas:
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yUpperBound) &&
			    	 (y > yLowerBound) )
			{
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			prevX = x;
			prevY = y;
		}
	}


	// calculate a sine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function sin(a, h, k, x)
	{
		return a*Math.sin(x-h)+k;
	}


	// calculate a cosine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function cos(a, h, k, x)
	{
		return a*Math.cos(x-h)+k;
	}


	// calculate a tangent function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function tan(a, h, k, x)
	{
		if( (x-h) % Math.PI == 0)
		{
			return Number.NaN;
		}
		else
		{
			return a*Math.tan(x-h)+k;
		}
	}


	// draw a sine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function drawSinEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of sine function
			var y = sin(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}


	// draw a cosine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function drawCosEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of cosine function
			var y = cos(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}

	// draw a tangent function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function drawTanEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value
			var prevX, prevY;

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of tangent function
			var y = tan(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
			}

			// otherwise, set ptScn1 to the old point, and set ptScn2 to the new point
			else
			{
				ptScn1 = ptScn2;
			}
			ptScn2 = gridLgcPtToCanvasPt(x, y);

			// if they are on opposite sides of the asymptote,
			// draw lines to the edge of the canvase as appropriate
			if( (a > 0) && (y < prevY) )
			{
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				var topPt = gridLgcPtToCanvasPt(prevX, yUpperBound);
				drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, color);

				var botPt = gridLgcPtToCanvasPt(x, yLowerBound);
				drawLine(botPt.x, botPt.y, ptScn2.x, ptScn2.y, color);
			}

 				// if a is negative, draw a line from the last point on the first arm to the top of the grid,
 				// and a line from the bottom of the grid to the first point on the second arm
 			else if( (a < 0) && (y > prevY) )
			{
				// if a is positive, draw a line from the last point on the first arm to the bottom of the grid,
 				// and a line from the top of the grid to the first point on the second arm
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				botPt = gridLgcPtToCanvasPt(prevX, yLowerBound);
				drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, color);

				topPt = gridLgcPtToCanvasPt(x, yUpperBound);
				drawLine(topPt.x, topPt.y, ptScn2.x, ptScn2.y, color);
			}

			// if the new point is off the canvas, and the old point is on the canvas,
			// draw a vertical line from the old point to the appropriate canvas edge.
			else if( (prevY < yUpperBound) &&
				(prevY > yLowerBound) &&
				(y > yUpperBound) )
			{
				topPt = gridLgcPtToCanvasPt(prevX, yUpperBound);
				drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, 1, color); //that.graphColor);
			}
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yLowerBound) )
			{
				botPt = gridLgcPtToCanvasPt(prevX, yLowerBound);
				drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, 1, color); //that.graphColor);
			}

			// if the new point is on the canvas, and the old point is off the canvas,
			// draw a vertical line from the appropriate canvas edge to the new point.
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY < yLowerBound) )
			{
				ptScn1 = gridLgcPtToCanvasPt(x, yLowerBound);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY > yUpperBound) )
			{
				ptScn1 = gridLgcPtToCanvasPt(x, yUpperBound);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}

			// if both points are on the canvas:
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yUpperBound) &&
			    	 (y > yLowerBound) )
			{
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			prevX = x;
			prevY = y;

		}
	}


	// calculate a quadratic function in standard form at a given x-value
	// a: coefficient of squared term
	// b: coefficient of linear term
	// c: constant term

	function qS(a, b, c, x)
	{
		return a*x*x + b*x + c;
	}


	// draw a quadratic function in standard form
	// a: coefficient of squared term
	// b: coefficient of linear term
	// c: constant term

	function drawQuadSEqn(a, b, c, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of quadratic function
			var y = qS(a,b,c,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}


	// calculate a quadratic function in vertex form at a given x-value
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift


	function qV(a, h, k, x)
	{
		return a*(x-h)*(x-h)+k;
	}


	// draw a quadratic function in standard form
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift

	function drawQuadVEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound,   // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = gridLgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = gridLgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of quadratic function
			var y = qV(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = gridLgcPtToCanvasPt(x, y);
				ptScn2 = gridLgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = gridLgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}



	function drawCircle(x_lgc, y_lgc, r_lgc, color)
	{
		// Safety checks -- don't allow negative radius
		if (r_lgc < 0)
			return;

		var ptScn1, ptScn2,
			r_px = gridXLgcLengthToPx(r_lgc);

		ptScn1 = gridLgcPtToCanvasPt(x_lgc, y_lgc);

		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		ctx.arc(ptScn1.x, ptScn1.y, r_px, 0, Math.PI * 2, false);

		ctx.stroke();
		ctx.closePath();
	}

	/******************************************************************************
	 Input (all in logic unit and need to be converted to Canvas px unit):
		  a, b - x and y axis of the hyperbola.
		  h, k - x,y distances from the center of hyperbola to the origin
				 of x,y system.

	  Note: The cnc.Eq is to compute y according to x as if h, k are zeros;
	  x type:
				hyperbola equation is:   x^2 / a^2 - y^2 / b^2 = 1;
							therefore:   y = +- b * sqrt(x^2 / a^2 - 1)

	  y type:
				hyperbola equation is:   y^2 / b^2 - x^2 / a^2 = 1;
							therefore:   y = +- b * sqrt(x^2 / a^2 + 1)

	  Algorithm:
	  	All the rendering is from the furthest opening points on the curve to the
	  center point where the degenerate points are (eccept for eliipse, which is
	  rendered from the center point to the furthest points on the x axis where the
	  degenarate points are).
	  When the curve becomes too steep (y increases faster than x does), the rendering
	  swhiches to the algorithm that uses y to generate x coordinate. -- NF, 6/5/2015
	*****************************************************************************/
	function initConics(color, h, k, a, b)
	{
		var cnc = {
			dotSize:     1, //2,
			hyperCenter: gridLgcPtToCanvasPt(h, k),
			xVertex:     0,		yVertex:     0,
			xVertexPx:   0,		yVertexPx:   0,
			bDrawNegativeX: true,
			bDrawPositiveY: true,
			xStart: xUpperBound + Math.abs(h), // consider after axis shifting
			yStart: yUpperBound + Math.abs(k),

			xCompare: function(x, h, a) { return x >= cnc.xVertex; },
			yCompare: function(y, k, b) { return y >= cnc.yVertex; },
		};

		cnc.dX = a / gridXLgcLengthToPx(a); // normalize the delta x
		if (b)
			cnc.dY = b / gridYLgcLengthToPx(b); // normalize the delta y
		else // hyperabla only has p which uses the position of a:
			cnc.dY = a / gridYLgcLengthToPx(a); // normalize the delta y

		cnc.dX = -cnc.dX;
		cnc.dY = -cnc.dY;

		// set transform matrix to identity:
		setTransformToIdentity(ctx);
		ctx.translate(cnc.hyperCenter.x, cnc.hyperCenter.y);

		ctx.fillStyle = color;
		return cnc;
	}


	// return true 	= use drawConics function for rendering
	//		  false	= use drawConicsYtoX function for rendering

	function shouldRenderConicsXtoY(cnc, x0, y0, h, k, a, b)
	{
		var deltaY = cnc.Eq(x0, a, b) - cnc.Eq(x0 + cnc.dX, a, b);
		var deltaX = cnc.EqYtoX(y0, a, b) - cnc.EqYtoX(y0 + cnc.dY, a, b);

		if (!deltaX ||	// when y is close to zero
			Math.abs(deltaY) <= Math.abs(deltaX))
			return true;

		return false;
	}

	/******************************************************************************
		Draw a conic type such as hyperbola in the equation (x type)
			(x-h)^2/a^2 - (y-k)^2/b^2 = 1
		or y type :
			(y-k)^2/b^2 - (x-h)^2/a^2 = 1

		Input (all in logic unit and need to be converted to Canvas px unit):
		  a, b - x and y axis of the hyperbola.
		  h, k - x,y distances from the center of hyperbola to the origin
				 of x,y system.

		algorithm:
		1. translate the system origin to h,k;
		2. compute y according to x as if h, k are zeros;

		therefore:   y = +- b * sqrt(x^2/a^2 - 1)
	 *****************************************************************************/
	function drawConics(cnc, color, h, k, a, b)
	{
		var x, y;
		var pt = {x:0, y:0};
//		ctx.fillStyle = color; // change color for debugging

		// use logic x to calculate logic y,
		// then convert to canvas coords before drawing it:
		for (x = cnc.xStart; 	cnc.xCompare(x, h, a); 	x += cnc.dX)
		{
			if (!y || shouldRenderConicsXtoY(cnc, x, y, h, k, a, b))
				y = cnc.Eq(x, a, b); //b * Math.sqrt( x*x / (a*a) - 1);
			else
			{
				cnc.yStart = y + cnc.dY;
				drawConicsYtoX(cnc, color, h, k, a, b);
				return;
			}

			pt.x = gridXLgcLengthToPx(x);
			pt.y = gridYLgcLengthToPx(y);

			drawDot( pt.x,  -pt.y, cnc.dotSize);

			if (cnc.bDrawNegativeX)    //conicType != 'parabolay2')
				drawDot(-pt.x,  -pt.y, cnc.dotSize);

			if (cnc.bDrawPositiveY) //conicType != 'parabolax2')
			{
				drawDot( pt.x, pt.y, cnc.dotSize);

				if (cnc.bDrawNegativeX) //conicType != 'parabolay2')
					drawDot(-pt.x, pt.y, cnc.dotSize);
			}
		}

		// be nice to next function and reset transform:
		setTransformToIdentity(ctx);
	}

	/******************************************************************************
	When a conic curve changes rapidly in the Y direction, marching an uniform step
	size along the x direction to compute Y will result missed rendering spaces on
	the curve. To solve the problem we need to march an uniform step along the Y
	direction to compute X at such locations. When the curve becomes gentle again
	along the Y direction we go back to march along the X direction for rendering.
	The result will be a clean and smoothly rendered conic curve. -- NF, 6/5/2015

	Input (all in logic unit and need to be converted to Canvas px unit):
	  a, b - x and y axis of the hyperbola.
	  h, k - x,y distances from the center of hyperbola to the origin
			 of x,y system.

	algorithm:
	1. translate the system origin to h, k;
	2. compute x according to y as if h, k are zeros;

	To draw a conic type such as hyperbola in the equation (x type)
			(x-h)^2/a^2 - (y-k)^2/b^2 = 1
	therefore:   x = +- a * sqrt(y^2/b^2 + 1)
	*****************************************************************************/
	function drawConicsYtoX(cnc, color, h, k, a, b)
	{
//		ctx.fillStyle = 'red'; // change color for debugging
		var x, y;
		var pt = {x:0, y:0};

		// use logic y to calculate logic x,
		// then convert to canvas coords before drawing it:
		for (y = cnc.yStart;	cnc.yCompare(y, k, b);	y += cnc.dY)
		{
			if (x && shouldRenderConicsXtoY(cnc, x, y, h, k, a, b))
			{
				cnc.xStart = x + cnc.dX;
				drawConics(cnc, color, h, k, a, b);
				return;
			}
			else
				x = cnc.EqYtoX(y, a, b);

			pt.x = gridXLgcLengthToPx(x);
			pt.y = gridYLgcLengthToPx(y);

			drawDot( pt.x,  -pt.y, cnc.dotSize);

			if (cnc.bDrawNegativeX)    //conicType != 'parabolay2')
				drawDot(-pt.x,  -pt.y, cnc.dotSize);

			if (cnc.bDrawPositiveY) //conicType != 'parabolax2')
			{
				drawDot( pt.x, pt.y, cnc.dotSize);

				if (cnc.bDrawNegativeX) //conicType != 'parabolay2')
					drawDot(-pt.x, pt.y, cnc.dotSize);
			}
		}

		// be nice to next function and reset transform:
		setTransformToIdentity(ctx);
	}


	// Math.sign shim. Math.sign is an experimental function
	// not available in all browsers

	function mathSign(value)
	{
		var number = +value;
		if (number === 0) return number;
		if (Number.isNaN(number)) return number;
		return number < 0 ? -1 : 1;
	}

 // GRID DRAWING

	function gridCreate(obj)
	{
		opts = obj;

		gridInit();
		gridDraw();
	}



	function initAxis(max_lgc, min_lgc, step_lgc, length_px, Offset_px)
	{
		var range_lgc = Math.abs(max_lgc - min_lgc);
		var idealNumGrids = 20, idealStep_lgc,
			maxNumGrids = idealNumGrids, minNumGrids = 4;
		var maxNum = Math.max(Math.abs(max_lgc), Math.abs(min_lgc));
		var metrics = ctx.measureText("-");
		_negSignW = metrics.width; // pixels

		var grid =
		{
			max_lgc: max_lgc,
			min_lgc: min_lgc,
			step_lgc: step_lgc,
			nScale: 1,
			decimalPoints: 1,  // change this to alter the decimal precision of grid

			toStr: function(x)
			{
				if (typeof(x) == "string")
					x = parseFloat(x);
				var f = x.toFixed(this.decimalPoints);
				var n = x.toFixed(0);
				if (f - n)
					return f;
				return n;
			}
		}
		grid.maxDigits = countDigits(maxNum);

		var totalNumGrids = Math.round(range_lgc / step_lgc);

		if (totalNumGrids > maxNumGrids || totalNumGrids < minNumGrids)
		{
			if (range_lgc > idealNumGrids)
				idealStep_lgc = Math.floor(range_lgc / idealNumGrids); // ideal granuality = 20 grids
			else
			{
				idealNumGrids = 8;
				idealStep_lgc = Math.floor(range_lgc / idealNumGrids * 10) / 10;
			}

			grid.step_lgc = idealStep_lgc;
			totalNumGrids = Math.round(range_lgc / idealStep_lgc);
		}

		grid.maxSingleSideGrids = Math.floor(Math.max(Math.abs(max_lgc), Math.abs(min_lgc)) / grid.step_lgc);
//        grid.maxGrids = Math.floor(Math.abs(max_lgc) / grid.step_lgc);
		grid.minGrids = Math.floor(Math.abs(min_lgc) / grid.step_lgc);

		// float result for accurate gird origin computation:
		grid.step_px = ( length_px - Offset_px * 2 ) / totalNumGrids;

		// compute the grid origin:
		grid.origin = Math.round(length_px - Offset_px - Math.abs(max_lgc * grid.step_px / grid.step_lgc));

		// get the interger step size:
		grid.step_px = Math.round(grid.step_px);

//        grid.decimalFactor = 2 / grid.step_lgc; // half point precision
//        if (grid.decimalFactor < 1)
//            grid.decimalPoints = 0;

		return grid;
	}

	/************************************************************************************
	  Initialize a

	  Input:
		xRange: [min, max, step size]
		yRange: [min, max, step size]
	************************************************************************************/
	function gridInit()
	{
		// Compute grid steps:
		var xOffset = 6, // pixels, so the edge of the grid can display points
			yOffset = 6;

		// index values for xRange, yRange to replace the magic numbers:
		var minIdx = 0, maxIdx=1, StepSize=2;

		_xGrid = initAxis(opts.xRange[maxIdx], opts.xRange[minIdx], opts.xRange[StepSize],
						  self.settings.width, xOffset);
		// y logic system is positive up, but y canvas system is positive down:
		_yGrid = initAxis(opts.yRange[minIdx], opts.yRange[maxIdx], opts.yRange[StepSize],
						  self.settings.height, yOffset);
	}

	/************************************************************************************
	  Draw a x,y coordinate grid on Canvas

	  Input:
		gridColor: Grid line color
		axisColor: color for the x,y axis
	************************************************************************************/
	function gridDraw()
	{
		var axisWidth = 1,
			ticHalfLength = 2, // pixels
			arrawLength = Math.round( 0.5 * _xGrid.step_px ),
			yTicBotm = _yGrid.origin + ticHalfLength,
			yTicTop = _yGrid.origin - ticHalfLength;

		// Paint background:
		if (self.settings.bg)
		{
			var imageData = ctx.getImageData(0, 0, self.settings.width, self.settings.height);
			imageData.data.set(self.settings.bg);
			ctx.putImageData(imageData, 0, 0);
		}
		else
		{
			ctx.fillStyle = style.bgColor;
			ctx.fillRect (0, 0, self.settings.width, self.settings.height);
		}

		var color = style.gridColor;
		var axisColor = style.axisColor;

		// draw grid:
		for (var i=1; i <= _xGrid.maxSingleSideGrids; i++)
		{
			for (var j=1; j <= _yGrid.maxSingleSideGrids; j++)
			{
				var y = j * _yGrid.step_px;

				drawLine(0, _yGrid.origin + y, self.settings.width, _yGrid.origin + y, axisWidth, color);

				if (j <= _yGrid.minGrids)
					drawLine(0, _yGrid.origin - y, self.settings.width, _yGrid.origin - y, axisWidth, color);
			}

			var x    = i * _xGrid.step_px;
			var x_px = _xGrid.origin + x;   // positive region of x:

			// draw short grid Tic on axis:
			drawLine(x_px, 0,         x_px, self.settings.height,   axisWidth, color);     // vertical grid lines
			drawLine(x_px, yTicBotm,  x_px, yTicTop,  axisWidth, axisColor); // tic bars

			if (i <= _xGrid.minGrids)
			{
				x_px = _xGrid.origin - x;   // negative region of x:
				drawLine(x_px, 0, x_px, self.settings.height, axisWidth, color);             // vertical grid lines
				drawLine(x_px, yTicBotm, x_px, yTicTop, axisWidth, axisColor); // tic bars
			}
		}

		printLabels(ticHalfLength, yTicBotm, yTicTop);

		// draw x axis:
		drawLine(0, _yGrid.origin, self.settings.width, _yGrid.origin, axisWidth, axisColor);

		// draw y axis:
		drawLine(_xGrid.origin, 0, _xGrid.origin, self.settings.height, axisWidth, axisColor);

		// draw arrows:
		drawArrow(self.settings.width-1, _yGrid.origin, 0, arrawLength * _xGrid.nScale, axisColor);  // on x-axis
		drawArrow(1, _yGrid.origin, 180, arrawLength * _xGrid.nScale, axisColor);  // on x-axis
		drawArrow(_xGrid.origin, 1, -90, arrawLength * _yGrid.nScale, axisColor);       // on y-axis
		drawArrow(_xGrid.origin, self.settings.height-1, 90, arrawLength * _yGrid.nScale, axisColor);       // on y-axis

		// set transform matrix to identity:
		setTransformToIdentity(ctx); // clean up the transform after drawArrow
	}



	function isPrintableX(x, str)
	{
		var metrics = ctx.measureText(str);
		var halfStrW = metrics.width / 2;
		return ( x + halfStrW < self.settings.width && x - halfStrW > 0 )
	}



	function isPrintableY(y, str)
	{
		// since measureText doesn't provide height, this is a approximation:
		var metrics = ctx.measureText("M");
		var halfStrH = metrics.width;

		return ( y + halfStrH < self.settings.height && y - halfStrH > 0 )
	}

	/************************************************************************************
	  Print labels on x and y axis of the grid

	  Input:
		ticHalfLength: half length of the tics on the x axis.
		yTicBotm, yTicTop:  top and bottom Y positions of the tics on the x axis.
		gridFont: font for the labels
		gridFontColor: color for the labels
	************************************************************************************/
	function printLabels(ticHalfLength, yTicBotm, yTicTop)
	{
		var xTextHoriz, yTextHoriz, xTextVert, yTextVert,
			xGridNumber, yGridNumber, content,
			yClearance = 4, // pixels
			xDecimalPts = 0, yDecimalPts = 0,
			iSkipPosit = 0, iSkipNegat = 0,
			maxDenorm = 8;

		var skipCnt = opts.labelSkip || 0;
		var skipStep = _yGrid.step_lgc * (skipCnt + 1),
			skipStepDelta = skipStep - skipStep.toFixed();
		if (skipStepDelta)
			yDecimalPts = 1;

		if (_xGrid.step_lgc < 1)
			xDecimalPts = 2;

		ctx.font = style.gridFont;
		ctx.fillStyle = style.gridFontColor; // light gray for grid lines
		ctx.textAlign = "center";

		// Print grid numbers on x axis:
		yTextHoriz = yTicBotm - ticHalfLength*3;
		for (var i=1; i <= _xGrid.maxSingleSideGrids; i++)
		{
			// position of the label:
			var x = i * _xGrid.step_px;
			xTextHoriz = _xGrid.origin + x;

			// numbers on x-axis:
			xGridNumber = (i * _xGrid.step_lgc).toFixed(xDecimalPts);
			if (opts.usePiLabels)
				content = decToFracPiStr(xGridNumber, maxDenorm);
			else
				content = xGridNumber;

			if (i < _xGrid.maxSingleSideGrids || isPrintableX(xTextHoriz, content))
				iSkipPosit = printOneLabel(content, xTextHoriz, yTextHoriz, iSkipPosit, skipCnt);

			xTextHoriz = _xGrid.origin - x - _negSignW;

			if (isPrintableX(xTextHoriz, content))
				iSkipNegat = printOneLabel("-"+content, xTextHoriz, yTextHoriz, iSkipNegat, skipCnt);
		}

		// Print grid numbers on y axis:
		ctx.textAlign = "right";
		iSkipPosit = iSkipNegat = 0;
		xTextVert = _xGrid.origin -3; // 3 pixels to the left of y axis

		for (var j=1; j <= _yGrid.maxSingleSideGrids; j++)
		{
			// numbers on y-axis:
			yGridNumber = (j * _yGrid.step_lgc).toFixed(yDecimalPts);

			// position of the label:
			var y = j * _yGrid.step_px;
			yTextVert = _yGrid.origin - y + yClearance;

			if (isPrintableY(yTextVert, yGridNumber))
				iSkipPosit = printOneLabel(yGridNumber, xTextVert, yTextVert, iSkipPosit, skipCnt);

			// logic y is positive up, while canvas y is positive down:
			yTextVert = _yGrid.origin + y - yClearance;
			if (isPrintableY(yTextVert, yGridNumber))
				iSkipNegat = printOneLabel("-"+yGridNumber, xTextVert, yTextVert, iSkipNegat, skipCnt);
		}
	}



	function printOneLabel(content, x, y, iSkip, skipCnt)
	{
		if (iSkip == skipCnt)
		{
			ctx.fillText(content, x, y);
			iSkip = 0;
		}
		else
			iSkip++;
		return iSkip;
	}

	/************************************************************************************
	 Convert a decimal number to string of a Pi factored fraction number.
	 Input:
		dec         - the decimal number to be converted,
		maxDenom    - optional
					  the max denormitor of the conversion precision, default is 16

	 Return:
		xFrac.upper - upper part of the factored fraction
		xFrac.lower - lower part of the factored fraction

	 example:       xDec = 1.57;  maxDenorm = 8;
					return: xFrac.upper = 1; xFrac.lower = 2;    (i.e. 1.57 = 1/2 Pi)
	************************************************************************************/
	function decToFracPiStr(dec, maxDenorm)
	{
		var numPi = 3.14;
		var str = Pi;

		xFrac = decToFrac(dec, numPi, maxDenorm);
		if (xFrac.upper < 0)
			str = "-" + Pi;

		if (xFrac.lower != xFrac.upper)
		{
			if (Math.abs(xFrac.upper) > 1)
				str = xFrac.upper + Pi;

			if (xFrac.lower > 1)
				str += '/' + xFrac.lower;
		}
		return str;
	}

	/************************************************************************************
	 Convert a decimal number to a factored fraction number.
	 Input:
		xDec        - the decimal number to be converted,
		comDenorm   - optional
					  the common denormitor used for factoring, most often this = Pi.
					  If just want to convert a decimal number to fraction number,
					  make this equal to 1, which is default.
		maxDenom    - optional
					  the max denormitor of the conversion precision, default is 16

	 Return:
		xFrac.upper - upper part of the factored fraction
		xFrac.lower - lower part of the factored fraction

	 example:       xDec = 1.57; comDenorm = 3.14; maxDenorm = 8;
					return: xFrac.upper = 1; xFrac.lower = 2;    (i.e. 1.57 = 1/2 Pi)
	************************************************************************************/
	function decToFrac(xDec, comDenorm, maxDenorm)
	{
		var xFrac = {}, factor = 1,
			iMaxDenorm = 16, iComDenorm = 1;

		if (comDenorm) iComDenorm = comDenorm;
		if (maxDenorm) iMaxDenorm = maxDenorm;
/*
		for (var i = 1; i < iMaxDenorm; i++)
		{
			for (var j=1; j<=i; j++)
				if ( (i * xDec) % (j * comDenorm) == 0) // found factor
					return factorOut(j, i);
		}
 */
		// the maxDenorm is not enough, so we round it up:
		xFrac.upper = Math.round(iMaxDenorm * xDec / comDenorm );
		xFrac.lower = iMaxDenorm;
		factorOut(xFrac);
		return xFrac;
	}



	function factorOut(frac) //upper, lower)
	{
		if (frac.upper === 1)
			return;

		for (var i=2; i <= frac.lower; i++)
		{
			if (frac.upper % i == 0 && frac.lower % i == 0)
			{
				frac.upper /= i;
				frac.lower /= i;
				factorOut(frac); // start again until no longer can be factored
			}
		}
	}

/*************************** public interface: ******************************************/



	function gridLgcPtToCanvasPt(xLgc, yLgc)
	{
		var ptScrn = {};
		ptScrn.x = xLgc * _xGrid.step_px / _xGrid.step_lgc + _xGrid.origin;
		ptScrn.y = -yLgc * _yGrid.step_px / _yGrid.step_lgc + _yGrid.origin;

		return ptScrn;
	}



	function gridXLgcLengthToPx(r_lgc)
	{
		return r_lgc * _xGrid.step_px / _xGrid.step_lgc;
	}

	function gridYLgcLengthToPx(r_lgc)
	{
		return r_lgc * _yGrid.step_px / _yGrid.step_lgc;
	}

	/**************************************************************************
	 The position of the mouse point is adjusted according to the round up
	 logical point. This is to make it easier for the user to click the
	 previous point displayed on the screen so the position doesn't have to be
	 exact.
	 Input:
		msePt_lgc   - x,y position of the mouse in logic unit
		color       - color of the mouse point, dashline, label
		dispPosition - if x,y position should be displayed
		label       - if a string lable should be printed in stead of x,y position
	**************************************************************************/
	function gridDrawMouseLgcPt(msePt_lgc, color, dispPosition, label)
	{
		var rCircle = 2; //pixels
		var yLableClearance = 16; // pixels

		if (!color)
			color = style.pointColor;

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		var msePt_px  = gridLgcPtToCanvasPt(msePt_lgc.x, msePt_lgc.y);
		var xLable = msePt_px.x,
			yLable = msePt_px.y - rCircle * 3;

		// draw the dot:
		//ctx.beginPath();
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		ctx.textAlign = "center";
		ctx.beginPath();

		ctx.arc(msePt_px.x, msePt_px.y, rCircle, 0, Math.PI * 2, false);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();

		// print the logical coordinates:
		var pt = {}
		pt.x = (msePt_lgc.x).toFixed(_xGrid.decimalPoints);
		pt.y = (msePt_lgc.y).toFixed(_yGrid.decimalPoints);

		var xStr = _xGrid.toStr(pt.x);
		if (opts.usePiLabels)
			xStr = decToFracPiStr(pt.x, 8);

		if (label)
			label = label.toUpperCase();
		else
		{
			if (dispPosition)
				label = '(' + xStr + ', ' + _xGrid.toStr(pt.y) + ')';
			else
				return; // work is done if no label
		}

		var metrics = ctx.measureText(label);
		var halfStrW = metrics.width / 2;

		// adjust position if the dot is near a border:
		if (msePt_px.x > self.settings.width - halfStrW)
			ctx.textAlign = "right";
		if (msePt_px.x < halfStrW)
			ctx.textAlign = "left";
		if (msePt_px.y < yLableClearance)
		{
			yLable = msePt_px.y + yLableClearance;
			if (!label) // label doesn't need to consider mouse cursor issue
			{
				if (msePt_px.x > that.w / 2)
				{
					ctx.textAlign = "right";
					xLable -= 6; // avoid the slanting down arrow handle
				}
				else
				{
					ctx.textAlign = "left";
					xLable += 12; // avoid the slanting down arrow handle
				}
			}
		}

		ctx.fillStyle = style.pointTextColor;
		ctx.fillText(label, xLable, yLable);
	}


	// Count the digits in a number

	function countDigits(num)
	{
		var digits = 0;

		if (num == 0)
			return 1;

		while (num > 0)
		{
			digits++;
			num = Math.floor(num / 10);
		}

		return digits;
	}

};
