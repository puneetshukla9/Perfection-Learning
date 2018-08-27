'use strict';

export default function(AssignmentHelper, AppState, $state, $timeout, State, PubSub, SciNote, $scope) {

	var ExtendedCSS = `
	.drops {
		border: 1px dashed #4683D5;
		display: inline-block;
		background: #fff;
		min-height: 30px;
		min-width: 120px;
	  vertical-align: middle;
		text-align:center;
	  margin: 0px 5px 0px 5px;
	}

	.drag_drop_elements {
		line-height: 34px;
	  padding: 10px;
	  background: #fff;
		border: 1px solid #4683d5;
	}

	table.draggable, table.matching {
		margin-top:10px;
		width:100%;
		display: table;
	}
	table.draggable tbody tr, table.matching tbody tr {
		border:1px solid #4683d5;
		display: table-row;
	}
	table.draggable .drag, table.matching td {
		border:1px solid #4683d5;
		height:40px;
		padding:10px;
		position:relative;
	}
	div.ansChoice.mcms {
	    left: 50%;
	    transform: translateY(-48%) translateX(-52%);
	    padding: 0;
	    line-height: 19px;
	    cursor: pointer;
	}
	div.ansChoice.mcms {
	    content: "✓";
	    font-weight: bold;
	    font-size: 16px;
	    position: absolute;
	    color: transparent;
	    top: 49%;
	    width: 21px;
	    height: 20px;
	    background: #EEEEEE;
	    border: 1px solid #B7B7B7;
	    padding-left: 7px;
	    /* padding-top: 2px; */
	}

	.dragsC {
	  width: auto;
	  //position: relative;
	  display: inline-block;
	  margin-right: 4px;
		margin-top: 2px;
	}

	.drags {
	  width: auto;
		position:relative;
	  padding: 4px;
		//background: #b9b9b9;
	  border: 1px solid #4683D5;
		line-height: 18px;
		text-align: center;
	}
	div.ansChoice.mcms.checked {
		color: #3D93AB;
	}

	.questionContainer {
		margin-top: 10px;
		margin-bottom: 10px;
		width: 100%;
		max-width: 800px;
		border: 1px solid #cacaca;
		background: -moz-linear-gradient(#e5e5e5, #cacaca);
		background: -webkit-linear-gradient(#e5e5e5, #cacaca);
		background: linear-gradient(#e5e5e5, #cacaca);
		padding: 10px;
	}
	.partTitle {
		clear:both;
	}

	.MultKinetic.frameSubmission, .MultKinetic.frameAnswer {
		border: 1px solid #3498db;
		background: white;
		display:inline-block;
		width:50px;
		padding: 3px;
	}
	.bOptionRow {
		position: relative;
		margin-right: 27px;
		cursor: pointer;
		width: 100%;
		margin-top: 10px;
	}
	.bOptionRow.pDisable{
		cursor:default;
	}
	.tableCell {
		display: table-cell;
		width: 40px;
		vertical-align: top;
		padding: 0;
	}
	.bRadioBtn {
		display: inline-block;
		height: 22px;
		width: 22px;
		vertical-align: middle;
		border: 1px solid #3498db;
	}
	.bOptionRow.selected .radioSelect {
		opacity:1;
	}
	.radioSelect {
		position: relative;
		top: 50%;
		left: 50%;
		-ms-transform: translateX(-50%) translateY(-50%);
		-webkit-transform: translateX(-50%) translateY(-50%);
		transform: translateX(-50%) translateY(-50%);
		height: 14px;
		width: 14px;
		-webkit-transition: all .2s;
		transition: all .2s;
		opacity: 0;
	}
	.bRadioText {
		display: table-cell;
		vertical-align: middle;
	}
`;
	var self = this;
	AssignmentHelper.isReadOnly(AppState.get('user_id'));

	var STIX_FONT_URL = '//perfectionlearning.com/mathematics/high-school-math/mathx/mathx-support-stix.html';

	var spacing = {};

	function init() {
		getAssignment();
		self.name = AssignmentHelper.getData().name;
		spacing = getPreviewSpacing(AssignmentHelper.getData().presentation_data);
	}

	function getPreviewSpacing(presentationData) {
		var preview_spacing = presentationData.preview_spacing || {};
		var probIds = Object.keys(preview_spacing);
		var spc = {};
		probIds.forEach((item) => {
			spc[item] = preview_spacing[item];
		});
		return spc;
	}

	if ($state.params.id) {
		AssignmentHelper.load($state.params.id).then(() => { init(); });
	} else {
		$timeout(() => { $state.go('assignGenApp.details'); });
	}

	self.printMode = false;
	self.showAnswers = false;

	// PubSub.subscribe('assignLoaded', refreshPage, $scope);

	$scope.stixPage = function() { window.open(STIX_FONT_URL, '_blank'); };

	// fixMatchingAnswer works specifically with the new "matching" problem type and expects
	// to receive a string of code. It was made to clear out checkmarks from checkboxes in
	// the table code developed by Mitr.
	// This code should probably go somewhere else--maybe in AssignmentHelper? It really
	// seems more problem-specific, though.
	function fixMatchingAnswer(code) {
		try {
			var el = document.createElement('div');
			el.innerHTML = code;
			var cells = el.getElementsByTagName('div');
			var keys = Object.keys(cells);
			keys.forEach((key) => {
				let classes = cells[key].classList;
				if (classes.contains('mcms') && !classes.contains('checked')) {
					cells[key].innerHTML = '';
				}
			});
		} catch (e) {
			console.log('createElement failed; the particulars:', e);
		}
		code = el.innerHTML;
		return code;
	}
	// Fetches and cleans up the assignment

	function getAssignment() {
		self.assign = AssignmentHelper.getExpanded();
		self.assignClone = [];
		self.replaceAnd = /the ('|"|&#8220;|&#8221;)and('|"|&#8220;|&#8221;) button/g;	// Declare once outside the loop for a small performance gain
		_.each(self.assign, function(prob, idx) {
			if (prob.ansType === 'matching' || prob.ansType === 'multi_part_answer') {
				prob.vtp.q = fixMatchingAnswer(prob.vtp.q);
				prob.vtp.a = fixMatchingAnswer(prob.vtp.a);
			}
			if (prob.vtp.prefix)
				prob.vtp.prefix = cleanAnd(prob.vtp.prefix);
			var probClone = _.merge({}, prob);

			checkAlwaysPrint(probClone);
			try {
				probClone = SciNote.previewTweak(probClone);
			} catch (e) {
				console.log('Error with SciNote.previewTweak', prob.probID, prob.vtp, e);
			}
			if (probClone.ansType === 'essay')
				fixAnswerFormat(probClone);
			prependProbNo(probClone, idx + 1);
			self.assignClone.push(probClone);
		});
	}

	function cleanAnd(str)	{
		return str.replace(self.replaceAnd, '"and"');
	}

	// Prepend problem number
	function prependProbNo(data, iter) {
		if (data.vtp) {
			if (hasPrintablePrefix(data.vtp)) {
				data.vtp.prefix = prependProbNoToField(iter, data.vtp.prefix);
			} else if (data.vtp.q) {
				data.vtp.q = prependProbNoToField(iter, data.vtp.q);
			}
			if (isMultChoice(data)) {
				data.vtp.a = prependProbNoToField(iter, '');
			} else {
				if (data.ansPrefix) {
					data.ansPrefix = prependProbNoToField(iter, data.ansPrefix);
				} else {
					data.vtp.a = prependProbNoToField(iter, data.vtp.a);
				}
			}
		} else {
			if (hasPrintablePrefix(data)) {
				data.prefix = prependProbNoToField(iter, data.prefix);
			} else {
				data.q = prependProbNoToField(iter, data.q);
			}
			if (isMultChoice(data) || isGraph(data)) {
				data.a = prependProbNoToField(iter, '');
			} else {
				if (data.ansPrefix) {
					data.ansPrefix = prependProbNoToField(iter, data.ansPrefix);
				} else {
					data.a = prependProbNoToField(iter, data.a);
				}
			}
		}
	}

	function isMultChoice(prob) {
		return prob.ansType === 'radio' || prob.ansType === 'check';
	}

	function isGraph(prob) {
		return prob.ansType.substr(0, 5) === 'graph';
	}

	// Test for prefix that doesn't have a no-print class.

	function hasPrintablePrefix(prob) {
		return !!(prob.prefix && /^<span [^>]*no-print.*?>.*?<\/span>$/.test(prob.prefix) === false);
	}


	// Prepend problem number on specific field.

	function prependProbNoToField(probNo, str) {
		str = str || ''; // Prevent 'undefined' from showing.
		return '<b>' + probNo + '</b>.&nbsp;' + str;
	}


	// Check answer for always-print class

	function checkAlwaysPrint(data) {
		var flag = false;
		var tmp;
		if (data.vtp) {
			tmp = data.vtp.a;
		} else {
			tmp = data.a;
		}

		if (/always-print/.test(tmp)) {
			flag = true;
		// For free input, provide clone of problem that won't have problem numbers inserted.
		// This is to prevent problem numbers showing up on answers that are to be printed.
			data.vtpClone = _.merge({}, data.vtp);
		}

		data.alwaysPrint = flag;
	}


	// Fix answer format: insert breaks, put in superscript.

	function fixAnswerFormat(data) {
		var lineBreak = /\n/g;
		var superScript = /\^([\d\w])/g;
		var tmp;
		if (data.vtp) {
			tmp = data.vtp.a;
		} else {
			tmp = data.a;
		}
		// Address the line break
		if (lineBreak.test(tmp)) {
			tmp = tmp.replace(lineBreak, '<br/>');
			tmp = '<div class="inserted-breaks">' + tmp + '</div>';
		}
		// Superscript
		tmp = tmp.replace(superScript, '<sup>$1</sup>');

		if (data.vtp) {
			data.vtp.a = tmp;
		} else {
			data.a = tmp;
		}
	}


	function getPrintHeader() {
		var includeMathJax =
		'<link rel="stylesheet" type="text/css" href="//cdnjs.cloudflare.com/ajax/libs/ng-tags-input/3.1.1/ng-tags-input.css">';

		var header = '<html><head>' +
			'<title>' + self.name + '</title>' +
			'<link rel="stylesheet" href="/stylesheets/print.css">' +
			'<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">';

		var MathJaxStyle = `
			<style type="text/css">
			.MJX_Assistive_MathML {
				position: absolute!important;
				top: 0;
				left: 0;
				clip: rect(1px, 1px, 1px, 1px);
				padding: 1px 0 0 0!important;
				border: 0!important;
				height: 1px!important;
				width: 1px!important;
				overflow: hidden!important;
				display: block!important;
				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none
			}
			.MJX_Assistive_MathML.MJX_Assistive_MathML_Block {
				width: 100%!important
			}
			</style>`;

		// Added these styles because the Print page was doing wonky things with roots.
		// Copied from code on rendered Preview page, where the roots look good.
		var style = [
		  '@font-face {' +
			'font-family: STIXMathJax_Main; ' +
			"src: url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/woff/STIXMathJax_Main-Regular.woff?V=2.7.1') " +
			"format('woff'), " +
			"url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/otf/STIXMathJax_Main-Regular.otf?V=2.7.1') " +
			"format('opentype')" +
		  '}',

			'@font-face {' +
			'font-family: STIXMathJax_Symbols; ' +
			"src: url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/woff/STIXMathJax_Symbols-Regular.woff?V=2.7.1') " +
			"format('woff'), " +
			"url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/otf/STIXMathJax_Symbols-Regular.otf?V=2.7.1') " +
			"format('opentype')" +
		  '}',

			'@font-face {' +
			'font-family: STIXMathJax_Main-italic; ' +
			"src: url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/woff/STIXMathJax_Main-Italic.woff?V=2.7.1') " +
			"format('woff'), " +
			"url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/otf/STIXMathJax_Main-Italic.otf?V=2.7.1') " +
			"format('opentype')" +
		  '}',

			'@font-face {' +
			'font-family: STIXMathJax_Size1; ' +
			"src: url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/woff/STIXMathJax_Size1-Regular.woff?V=2.7.1') " +
			"format('woff'), " +
			"url('//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/fonts/HTML-CSS/STIX-Web/otf/STIXMathJax_Size1-Regular.otf?V=2.7.1') " +
			"format('opentype')" +
		  '}'

		];

		header += includeMathJax + MathJaxStyle + '<style type="text/css">' + style.join('</style><style type="text/css">') + '</style>';

		return header;
	}

	function getPrintFooter() {
		var includeMathJax =
			'<script type="text/x-mathjax-config">' +
			  'MathJax.Hub.Config({' +
				'"HTML-CSS": {' +
					'availableFonts: [],' +
					'preferredFont: null,' + // force Web fonts
					'webFont: "STIX-Web",' +
					'matchFontHeight: false' +
				'},' +
				'styles: {' +
					'".vtp, .mi, .mn, .mtext": {"font-family": "inherit!important" }' +
				'},' +
				'skipStartupTypeset: true' +
			'});' +
			'</script>' +
			'<script src="//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=MML_HTMLorMML-full.js"></script>';

		var footer = '</body></html>';

		footer = includeMathJax + footer;

		return footer;
	}

	// Replace canvas tags with image tags.
	// This is a workaround to for context.drawImage, which
	// MS Edge was choking on.

	var replaceCanvasWithImg = function(src) {
		var srcList = document.getElementsByTagName('canvas');
		// Either of these regular expressions appears to work. Not sure if there's a need to
		// keep the <kb-graph> wrapping.
		var canvasRe = /<kb\-graph.*?kb-graph>/gi; // <canvas> tags are wrapped in this.
		canvasRe = /<canvas.*?canvas>/gi;
		var result;

		for (var i = 0, j = srcList.length; i < j; i++) {
			result = canvasRe.exec(src);
			var img = '<img style="border:1px solid black" src="' + srcList[i].toDataURL() + '">';

			src = src.replace(result[0], img);
		}

		return src;
	};


	// Open another tab that contains a printable version
	// of the assignment.
	// Also immediately opens the print dialog.

	self.print = function() {
		var header = getPrintHeader();
		header +=
			'<style>' +
				'body, html {height: auto}' +		// Override height hack in CSS
//				'.vtp {color: black}' +				// Override VTP highlighting
				'#answerList {display: none}' +		// Hide answers
				'.adjust-space-btns {display: none}' + // Hide spacer button.
				'.spacer { height:26px }' +
				ExtendedCSS +
			'</style>' +
			'<body id="for-print" onload="window.print()">';

		var footer = getPrintFooter();

		var newwindow = window.open();

		var newdocument = newwindow.document;
		var assignHTML = document.getElementById('preview').innerHTML;

		// Replace any canvas tags with img tags.
		// This must be done before the HTML is written to newdocument.
		var dest = replaceCanvasWithImg(assignHTML);

		//newdocument.write(header + assignHTML + footer);
		newdocument.write(header + dest + footer);

		// Duplicate canvas from source to destination
		// The above call to replaceCanvasWithImg makes copyCanvas unnecessary.
		//copyCanvases(document, newdocument);

		newdocument.close();
	};



	self.printAnswers = function()
	{
		var header = getPrintHeader();
		header +=
			'<style>' +
				'body, html {height: auto}' +		// Override height hack in CSS
				'#answerList {display: block}' +	// Show answers (normally hidden)
				'#previewList {display: none}' +	// Hide list
				'.drag_drop_elements { display:inline }' +
				'.drag_drop_elements p { display:inline }' +
				'.blank {' +
				'	border: 1px dashed #8A8A8A;' +
				'	display: inline-block;' +
				'	background: #fff;' +
				'	min-height: 30px;' +
				'	min-width: 120px;' +
				' vertical-align: middle;' +
				'	text-align:center;' +
				' margin: 0px 5px 0px 5px;' +
				'}' +
ExtendedCSS +
				'.header {display:none}' +           // Hide Name, Class, Date on answers page.
			'</style>' +
			'<body id="for-print" onload="window.print()">';
		var footer = '</body></html>';

		var newwindow = window.open();
		var newdocument = newwindow.document;
		var assignHTML = document.getElementById('preview').innerHTML;

		// Replace any canvas tags with img tags.
		// This must be done before the HTML is written to newdocument.
		var dest = replaceCanvasWithImg(assignHTML);

		newdocument.write(header + dest + footer);
		// Duplicate canvas from source to destination
		// copyCanvases(document, newdocument);

		newdocument.close();
	};

	function copyCanvases(src, dest) {
		// These better be the same length!
		var srcList = src.getElementsByTagName('canvas');
		var destList = dest.getElementsByTagName('canvas');

		for (var i = 0, len = srcList.length; i < len; i++) {
			if (srcList[i] && destList[i]) {
				var destCtx = destList[i].getContext('2d');
				try {
					destCtx.drawImage(srcList[i], 0, 0);
				} catch (e) {
					console.log('drawImage error', e, srcList[i]);
				}
			}
		}
	}

	// Determines whether the answer field should be shown

	self.doShowAnswer = function(prob) {
		return (prob.ansType === 'freeInput');
	};

	self.mcType = function(prob) {
		if (prob.ansType === 'radio')
			return 'radio';
		return 'checkbox';
	};

	self.spacing = function(problemId) {
		var spc = spacing[problemId] ? new Array(spacing[problemId]) : [];
		return spc;
	};

	// Adjust space between problems, adding or subtracting by 10px.
	// Prevent decrease of space if bottom margin is 0.
	self.adjustSpace = function(obj, probId, mult) {
		var elToSpaceOut = obj.target.parentNode.parentNode.parentNode;
		if (mult > 0) {
			var spacer = document.createElement('div');
			spacer.className = 'spacer';
			spacer.style = 'height:26px';
			elToSpaceOut.appendChild(spacer);
		} else {
			var spacers = elToSpaceOut.getElementsByClassName('spacer');
			if (spacers.length > 0) {
				var el = spacers[0];
				elToSpaceOut.removeChild(el);
			}
		}
		spacers = elToSpaceOut.getElementsByClassName('spacer');
		AssignmentHelper.adjustSpacing(probId, spacers.length);
	};
};
