var ExtendedTypes =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	Object.defineProperty(exports, "__esModule", { value: true });
	var drag_and_drop_1 = __webpack_require__(2);
	var matching_item_1 = __webpack_require__(5);
	var select_text_1 = __webpack_require__(6);
	var open_response_1 = __webpack_require__(7);
	var editing_task_1 = __webpack_require__(8);
	var editing_task_choice_1 = __webpack_require__(9);
	var equation_editor_1 = __webpack_require__(10);
	var table_items_1 = __webpack_require__(11);
	var multiPart_1 = __webpack_require__(12);
	var oldTypes_1 = __webpack_require__(13);
	//import vtp from './VTPGraph';
	var grid2_1 = __webpack_require__(14);
	var default_1 = /** @class */ (function () {
	    function default_1(data, config) {
	        var presentation_data = data.presentation_data || data.presentationData;
	        var type = presentation_data.type;
	        if (type === 'drag_drop_1') {
	            return new drag_and_drop_1.default(data, config);
	        }
	        else if (type === 'multi_part_answer') {
	            return new multiPart_1.default(data, config);
	        }
	        else if (type === 'matching') {
	            return new matching_item_1.default(data, config);
	        }
	        else if (type === 'multiselect') {
	            return new select_text_1.default(data, config);
	        }
	        else if (type === 'select_text') {
	            return new select_text_1.default(data, config);
	        }
	        else if (type === 'open_response') {
	            return new open_response_1.default(data, config);
	        }
	        else if (type === 'editing_tasks') {
	            return new editing_task_1.default(data, config);
	        }
	        else if (type === 'editing_tasks_choice') {
	            return new editing_task_choice_1.default(data, config);
	        }
	        else if (type === 'equation_edit_1') {
	            return new equation_editor_1.default(data, config);
	        }
	        else if (type === 'equation_edit_2') {
	            return new equation_editor_1.default(data, config);
	        }
	        else if (type === 'table_items') {
	            return new table_items_1.default(data, config);
	        }
	        else if (type === 'grid2') {
	            return new grid2_1.default(data, config);
	        }
	        else if (data.ansType === 'essay') {
	            return new open_response_1.default(data, config);
	        }
	        if (!data.presentation_data || Object.keys(data.presentation_data).length === 0) {
	            if (data.ansType === 'VTPGraph') {
	                return new oldTypes_1.default(data, config);
	            }
	            else {
	                return new oldTypes_1.default(data, config);
	            }
	        }
	    }
	    return default_1;
	}());
	exports.default = default_1;
	;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Drag And Drop 1
	 * Author: Rick Toews
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var DragDrop1 = /** @class */ (function (_super) {
	    __extends(DragDrop1, _super);
	    /*
	    The constructor accepts the problem object and a configuration hash. The config will be passed in from the drag-and-drop template.
	    The config can be arranged as follows:
	    config = {
	        // flag indicating whether or not to display blanks with answers pre-filled.
	        // *** Probably don't need this anymore. ***
	        fillIn: false,
	    
	        // hash of classes to be used for constructed DOM components.{
	        classes:
	            dropArea: 'drops',  // class for blanks in the answer block
	            draggableContainer: 'dragsC', // class for container for a draggable answer block
	            draggable: 'drags', // class for draggable answer block
	            dropped: 'dropped'  // class to mark answer black that was used in a blank
	        },
	    
	        // hash of tools needed in processing. Currently used only if appendElements() is to be called.
	        inject: {
	            $: $,
	            MathJax: MathJax
	        },
	    
	        // Hash of elements to attach DOM components to.
	        dom: {
	            el: el, // This is the el element received by the initialize function of EOC_template files.
	            ansContainer: ansContainer
	        },
	    
	        // URL for image location
	        imgSrc: CONFIG.baseUrl + '/media/'
	    };
	    
	    NOTE: The above can be adjusted as necessary, depending on the problem type.
	    */
	    function DragDrop1(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        // HTML templates
	        _this.templates = {
	            tableRow: '<tr class="table-row"></tr>',
	            tableCellDrop: '<td type="text" class="dndtable-cell">__TEXT__<div class="__CLASS__" data-id="__ID__">__ANS__</div></td>',
	            tableCellText: '<td type="text" class="dndtable-cell">__TEXT__</td>'
	        };
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.config = config;
	            _this.correctAnswers = _this.parseAnswerIndexes(data.a);
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	                // createDragBoxes returned an array of draggable items, not a string of HTML code.
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    DragDrop1.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: 'dropBox', code: '' },
	            { name: 'draggable', code: '', raw: this.formatDraggable() },
	            { name: 'blank', code: this.formatBlank() },
	            { name: 'answer', code: this.formatAnswer() },
	            { name: 'submission', code: this.formatSub() }
	        ] : [];
	        console.log('blocks:', this.probID, blocks);
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    DragDrop1.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = blockObj.code;
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	            $(block).appendTo(_this.config.dom.ansContainer);
	        });
	        var drops = this.config.dom.el.find("." + this.config.classes.dropArea);
	        var drags = this.config.dom.el.find("." + this.config.classes.draggable);
	        var dragsC = this.$(this.config.dom.ansContainer.find("." + this.config.classes.draggableContainer));
	        return {
	            drops: drops,
	            drags: drags,
	            dragsC: dragsC
	        };
	    };
	    //---------- PRIVATE ----------
	    DragDrop1.prototype.draggableToTable = function (items) {
	        var columns = 3;
	        var tableRows = [];
	        var row = [];
	        var t = [];
	        while (items.length % columns > 0) {
	            items.push('');
	        }
	        items.forEach(function (item, ndx) {
	            if (ndx && ndx % columns === 0) {
	                t.push(row);
	                var rowCode = '<tr>' + row.join('') + '</tr>';
	                tableRows.push(rowCode);
	                row = [];
	            }
	            var wrapped = '<td style="text-align:center" class="drag">' + item + '</td>';
	            row.push(wrapped);
	        });
	        t.push(row);
	        tableRows.push('<tr>' + row.join('') + '</tr>');
	        var table = '<table class="draggable"><tbody>' + tableRows.join('') + '</tbody></table>';
	        return table;
	    };
	    // formatBlank: return blank answer template, wtihout correct answers filled in.
	    DragDrop1.prototype.formatBlank = function () {
	        var frame = this.frames[0];
	        var draggable = this.formatDraggable();
	        var table = this.draggableToTable(draggable);
	        var blankParts = [frame.blank, table];
	        return blankParts.join('');
	        ;
	    };
	    // formatAnswer: return answer template, with correct answers.
	    DragDrop1.prototype.formatAnswer = function () {
	        var frame = this.frames[0];
	        return frame.answer;
	    };
	    // formatSub: return submission content, including HTML tags.
	    DragDrop1.prototype.formatSub = function () {
	        var frame = this.frames[0];
	        return frame.submitted;
	    };
	    // formatDraggable: return draggable elements, including HTML tags.
	    DragDrop1.prototype.formatDraggable = function () {
	        // this.frames[1] is a list of draggable items, not a string of HTML code.
	        return this.frames[1];
	    };
	    // Generate drop indicator pattern. This one's ugly and so is in its own function.
	    DragDrop1.prototype.getDropIndicatorPattern = function (dropIndicator) {
	        var patternStr = dropIndicator
	            .replace('[', '\\[')
	            .replace(']', '\\]')
	            .replace(/\|/g, '\\|')
	            .replace('%id', '(.+?)');
	        var pattern = new RegExp(patternStr, 'ig'); //\|\[(.+?)\]\|/ig;
	        return pattern;
	    };
	    DragDrop1.prototype.makeImgTag = function (text) {
	        var temp = (text.split(':')[1]).trim();
	        var src = this.config.imgSrc + (temp).substring(0, temp.length - 1);
	        var imgTag = '<img src="' + src + '" style="pointer-events: none">';
	        return imgTag;
	    };
	    // Function to create text containing blanks for dragging answers.
	    DragDrop1.prototype.createDropBox = function (frameText, frameContents, pattern) {
	        var result;
	        result = { blank: '', blanks: '', answer: '', submitted: '' };
	        var textItems = frameText.split(pattern);
	        var blank = frameText.split(pattern);
	        var answer = frameText.split(pattern);
	        var submitted = frameText.split(pattern);
	        var l = textItems.length;
	        for (var i = 1; i < l; i += 2) {
	            var ndx = frameContents[textItems[i]].id;
	            var line = frameContents[textItems[i]].line;
	            var classArr = [this.config.classes.dropArea, line];
	            var classes = classArr.join(' ');
	            var answerBlock = this.correctAnswerBlocks[ndx] === undefined ? '' : this.correctAnswerBlocks[ndx];
	            var submittedBlock = this.submittedAnswerBlocks[ndx] === undefined ? '' : this.submittedAnswerBlocks[ndx];
	            var blankBlock = '';
	            if (this.config.fillIn) {
	                textItems[i] = '<span class="' + classes + '">' + answerBlock + '</span>';
	            }
	            else {
	                textItems[i] = '<span class="' + classes + '"></span>';
	            }
	            answer[i] = '<span class="' + classes + '">' + answerBlock + '</span>';
	            submitted[i] = '<span class="' + classes + '">' + submittedBlock + '</span>';
	            blank[i] = '<span class="' + classes + '">' + blankBlock + '</span>';
	        }
	        result.blanks = textItems.join(' ');
	        result.blank = blank.join(' ');
	        result.answer = answer.join(' ');
	        result.submitted = submitted.join(' ');
	        return result;
	    };
	    // Calculate row and column counts for table.
	    DragDrop1.prototype.getTableCounts = function (tableContent) {
	        var rowCount = tableContent[0].length;
	        var colCount = Object.keys(tableContent).length;
	        return { row: rowCount, col: colCount };
	    };
	    // The idea here is to fix answer blocks to match table content array structure.
	    // Am at present possibly non compos mentis, having a sense of mental strabismus, so it's possible that this function, while seeming
	    // to produce the desired results for a few problems (7.1, 12, 1) will have calamitous effects for others.
	    DragDrop1.prototype.adjustAnswerBlocksForTable = function (tableContent) {
	        var is2d = Array.isArray(this.correctAnswerBlocks) && Array.isArray(this.correctAnswerBlocks[0]);
	        var cols = Object.keys(tableContent).length;
	        var rows = tableContent[0].length;
	        var correctBlocks = [];
	        var submittedBlocks = [];
	        for (var c = 0; c < cols; c++) {
	            for (var r = 0; r < rows; r++) {
	                var ansNdx = c * cols + r;
	                if (correctBlocks[c] === undefined)
	                    correctBlocks[c] = [];
	                if (submittedBlocks[c] === undefined)
	                    submittedBlocks[c] = [];
	                var correctBlock = '', submittedBlock = '';
	                try {
	                    correctBlock = is2d ? this.correctAnswerBlocks[c][r] : this.correctAnswerBlocks[ansNdx];
	                }
	                catch (e) {
	                    correctBlock = '';
	                }
	                try {
	                    submittedBlock = is2d ? this.submittedAnswerBlocks[c][r] : this.submittedAnswerBlocks[ansNdx];
	                }
	                catch (e) {
	                    submittedBlock = '';
	                }
	                correctBlocks[c][r] = correctBlock;
	                submittedBlocks[c][r] = submittedBlock;
	            }
	        }
	        this.correctAnswerBlocks = correctBlocks;
	        this.submittedAnswerBlocks = submittedBlocks;
	    };
	    // Create dropbox from table
	    DragDrop1.prototype.createDropBoxTable = function (tableContent, frameContents, pattern) {
	        this.adjustAnswerBlocksForTable(tableContent);
	        var result;
	        result = { blank: '', answer: '', submitted: '' };
	        var id = 0, blankRowNdx = 0;
	        var counts = this.getTableCounts(tableContent);
	        var blankCols = [];
	        var blankRows = [];
	        var ansRows = [];
	        var subRows = [];
	        for (var rowNdx = 0; rowNdx < counts.row; rowNdx++) {
	            var blankCols = [];
	            var ansCols = [];
	            var subCols = [];
	            var matchedPattern = false;
	            var blankColNdx = 0;
	            for (var colNdx = 0; colNdx < counts.col; colNdx++) {
	                var text = tableContent[colNdx][rowNdx];
	                var blankCell = this.templates.tableCellText;
	                var ansCell = this.templates.tableCellText;
	                var subCell = this.templates.tableCellText;
	                var cell = {
	                    blank: this.templates.tableCellText,
	                    ans: this.templates.tableCellText,
	                    sub: this.templates.tableCellText
	                };
	                if (text.match(pattern)) {
	                    matchedPattern = true;
	                    text = text.split(pattern)[0];
	                    var answerBlock = '';
	                    var submittedBlock = '';
	                    try {
	                        answerBlock = this.correctAnswerBlocks[blankColNdx][blankRowNdx] === undefined ? '' : this.correctAnswerBlocks[blankColNdx][blankRowNdx];
	                    }
	                    catch (e) {
	                    }
	                    try {
	                        submittedBlock = this.submittedAnswerBlocks[blankColNdx][blankRowNdx] === undefined ? '' : this.submittedAnswerBlocks[blankColNdx][blankRowNdx];
	                    }
	                    catch (e) {
	                    }
	                    blankCell = this.templates.tableCellDrop.replace('__ID__', String(id));
	                    ansCell = blankCell.replace('__ANS__', answerBlock);
	                    subCell = blankCell.replace('__ANS__', submittedBlock);
	                    blankCell = this.templates.tableCellDrop.replace('__ANS__', '');
	                    id++;
	                }
	                if (typeof text === 'string' && (text).indexOf('img') != -1) {
	                    text = this.makeImgTag(text);
	                }
	                blankCell = blankCell.replace('__TEXT__', text);
	                blankCell = blankCell.replace('__CLASS__', 'dotted drops');
	                ansCell = ansCell.replace('__TEXT__', text);
	                ansCell = ansCell.replace('__CLASS__', 'dotted drops');
	                subCell = subCell.replace('__TEXT__', text);
	                subCell = subCell.replace('__CLASS__', 'dotted drops');
	                blankCols.push(blankCell);
	                ansCols.push(ansCell);
	                subCols.push(subCell);
	                if (matchedPattern) {
	                    blankColNdx++;
	                }
	            }
	            blankRows.push('<tr>' + blankCols.join('') + '</tr>');
	            ansRows.push('<tr>' + ansCols.join('') + '</tr>');
	            subRows.push('<tr>' + subCols.join('') + '</tr>');
	            if (matchedPattern) {
	                blankRowNdx++;
	            }
	        }
	        var blankTableEl = ['<table class="draggable">' + blankRows.join('') + '</table>'];
	        var ansTableEl = ['<table class="draggable">' + ansRows.join('') + '</table>'];
	        var subTableEl = ['<table class="draggable">' + subRows.join('') + '</table>'];
	        result.blank = blankTableEl.join(' ');
	        result.answer = ansTableEl.join(' ');
	        result.submitted = subTableEl.join(' ');
	        return result;
	    };
	    // Create draggable boxes.
	    DragDrop1.prototype.createDragBoxes = function (contents) {
	        var _this = this;
	        var dragBoxes = [];
	        this.answerBlocks.forEach(function (text, value) {
	            var ansNdx = contents[value];
	            var classArr = [_this.config.classes.draggable];
	            var containerClass = _this.config.classes.draggableContainer;
	            if (_this.data._complete && _this.correctAnswers.indexOf(ansNdx) !== -1) {
	                classArr.push(_this.config.classes.dropped);
	            }
	            var classes = classArr.join(' ');
	            if (typeof text.ans === 'string' && (text.ans).indexOf('img') != -1) {
	                var dragContent = _this.makeImgTag(text.ans);
	            }
	            else {
	                dragContent = text.ans;
	            }
	            //			dragBoxes.push("<div class='" + containerClass + "'><div class='" + classes + "' data-id='" + value + "'>" + dragContent + "</div></div>");
	            dragBoxes.push(dragContent);
	        });
	        //		return dragBoxes.join('');
	        return dragBoxes;
	    };
	    // Process item from interactive_frames array.
	    DragDrop1.prototype.createInteractiveFrames = function (frameData) {
	        var result;
	        this.partNdx = this.getPartNdx(frameData);
	        //this.delimiter = frameData.delimiter;
	        // Always use '|' as the drag-and-drop delimiter, since elements within a drag-and-drop answer or submission are comma.
	        this.delimiter = '|';
	        if (frameData.interaction_method === 'drag_drop_elements') {
	            this.correctAnswerBlocks = this.createCorrectAnswerBlocks(this.data.a, this.answer_val_map);
	            this.submittedAnswerBlocks = this.createSubmittedAnswerBlocks(this.orig_submission, this.answer_val_map);
	            var dropIndicatorPattern = this.getDropIndicatorPattern(frameData.drop_indicator);
	            if (frameData.isTable) {
	                result = this.createDropBoxTable(frameData.column_row_vals, frameData.contents, dropIndicatorPattern);
	            }
	            else {
	                result = this.createDropBox(frameData.text, frameData.contents, dropIndicatorPattern);
	            }
	            //			result.blanks = '<div class="' + frameData.interaction_method + '">' + result.blanks + '</div>';
	            result.blank = '<div class="' + frameData.interaction_method + '">' + result.blank + '</div>';
	            result.answer = '<div class="' + frameData.interaction_method + '">' + result.answer + '</div>';
	            result.submitted = '<div class="' + frameData.interaction_method + '">' + result.submitted + '</div>';
	        }
	        else if (frameData.interaction_method === 'drag_elements') {
	            this.correctAnswerBlocks = this.createCorrectAnswerBlocks(this.data.a, this.answer_val_map);
	            this.answerBlocks = this.createAnswerBlocks(frameData.contents, this.answer_val_map);
	            result = this.createDragBoxes(frameData.contents);
	            //			result = '<div class="' + frameData.interaction_method + '">' + result + '</div>';
	            // Result is an array of draggable items now, not a string of HTML code.
	        }
	        return result;
	    };
	    // Compile list of correct answers from answer_val_map.
	    DragDrop1.prototype.createCorrectAnswerBlocks = function (prob_ans, answer_val_map) {
	        var _this = this;
	        var delim = this.delimiter;
	        var colAnswerBlocks = [];
	        var colAnswers = prob_ans.split(delim);
	        for (var i = 0; i < colAnswers.length; i++) {
	            var answerBlocks = [];
	            //			var answers = prob_ans.split(',').map((item) => parseInt(item, 10));
	            var answers = colAnswers[i].split(',').map(function (item) { return parseInt(item, 10); });
	            answers.forEach(function (aNdx) {
	                var ans = answer_val_map[aNdx] === undefined ? '' : answer_val_map[aNdx];
	                if (typeof ans === 'string' && ans.indexOf('img') !== -1) {
	                    ans = _this.makeImgTag(ans);
	                }
	                answerBlocks.push(ans);
	            });
	            colAnswerBlocks.push(answerBlocks);
	        }
	        return colAnswerBlocks.length === 1 ? colAnswerBlocks[0] : colAnswerBlocks;
	    };
	    // Compile list of submitted answers from answer_val_map.
	    DragDrop1.prototype.createSubmittedAnswerBlocks = function (prob_ans, answer_val_map) {
	        var _this = this;
	        var delim = this.delimiter;
	        var colAnswerBlocks = [];
	        var colAnswers = prob_ans.split(delim);
	        // prob_ans can be a string, if single, or array, if multipart. If an array, will need to get the part corresponding to the partNdx.
	        // and yes: this is a really hacky way to do it.
	        if (typeof prob_ans !== 'string')
	            prob_ans = prob_ans[this.partNdx];
	        if (!prob_ans)
	            prob_ans = '';
	        for (var i = 0; i < colAnswers.length; i++) {
	            var answerBlocks = [];
	            //			var answers = prob_ans.split(',').map((item) => parseInt(item, 10));
	            var answers = colAnswers[i].split(',').map(function (item) { return parseInt(item, 10); });
	            answers.forEach(function (aNdx) {
	                var ans = answer_val_map[aNdx] === undefined ? '' : answer_val_map[aNdx];
	                if (typeof ans === 'string' && ans.indexOf('img') !== -1) {
	                    ans = _this.makeImgTag(ans);
	                }
	                answerBlocks.push(ans);
	            });
	            colAnswerBlocks.push(answerBlocks);
	        }
	        return colAnswerBlocks.length === 1 ? colAnswerBlocks[0] : colAnswerBlocks;
	    };
	    DragDrop1.prototype.createAnswerBlocks = function (contents, answer_val_map) {
	        var answerBlocks = [];
	        contents.forEach(function (ans) {
	            answerBlocks.push({ ans: answer_val_map[ans], correct: false });
	        });
	        return answerBlocks;
	    };
	    DragDrop1.prototype.parseAnswerIndexes = function (a) {
	        var arr = a.split(',');
	        arr = arr.map(function (item) { return parseInt(item, 10); });
	        return arr;
	    };
	    return DragDrop1;
	}(eoc_1.default));
	exports.default = DragDrop1;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var helper_1 = __webpack_require__(4);
	'use strict';
	var default_1 = /** @class */ (function () {
	    function default_1(data, config) {
	        this.data = helper_1.JSONsafeParse(JSON.stringify(data)).json;
	        this.probID = data.probID;
	        this.studentID = data.uid;
	        this.presentation_data = this.data.presentation_data || this.data.presentationData;
	        this.type = this.presentation_data.type;
	        this.interactive_frames = this.presentation_data.interactive_frames;
	        this.answer_val_map = this.presentation_data.answer_val_map;
	        this.orig_submission = this.data.orig_submission;
	    }
	    default_1.prototype.getPartNdx = function (frame) {
	        var partNdx = 0;
	        if (frame.part_id) {
	            var bits = frame.part_id.split('_');
	            partNdx = bits[1];
	        }
	        return partNdx;
	    };
	    return default_1;
	}());
	exports.default = default_1;
	;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSONsafeParse = function (str) {
	    var result;
	    try {
	        // valid: flag to indicate successful parse; str: the original string; json: the resulting json object
	        result = { valid: true, str: str, json: JSON.parse(str) };
	    }
	    catch (e) {
	        // valid: flag to indicate unsuccessful parse; str: the original string; json: empty object; error: exception data object
	        result = { valid: false, str: str, json: {}, error: e };
	        // console.log('Output a message for the developer, for diagnostic use.');
	    }
	    return result;
	};
	exports.cleanEntities = function (string) {
	    var textarea = document.createElement('TEXTAREA');
	    textarea.innerHTML = string;
	    var sub = textarea["value"];
	    textarea.remove();
	    return sub;
	    // return string.replace(/&#(\d+);/g, function (match, dec) {
	    //     return String.fromCharCode(dec);
	    // });
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Matching
	 * Author: Rick Toews
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var Matching = /** @class */ (function (_super) {
	    __extends(Matching, _super);
	    function Matching(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.config = config;
	            _this.correctAnswers = _this.parseAnswerIndexes(data.a);
	            _this.submittedAnswers = _this.parseAnswerIndexes(data.orig_submission);
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    Matching.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: 'matching', code: this.formatMatching() },
	            { name: 'submission', code: this.formatSub() },
	            { name: 'blank', code: this.formatBlank() },
	            { name: 'answer', code: this.formatAnswer() }
	        ] : [];
	        console.log('matching; blocks', this.probID, blocks);
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    Matching.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = blockObj.code.blanks;
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	            $(block).appendTo(_this.config.dom.ansContainer);
	        });
	    };
	    //---------- PRIVATE ----------
	    Matching.prototype.formatBlank = function () {
	        return this.frames[0].blanks;
	    };
	    Matching.prototype.formatAnswer = function () {
	        return this.frames[0].answer;
	    };
	    Matching.prototype.formatMatching = function () {
	        return this.frames[0];
	    };
	    Matching.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    Matching.prototype.createInteractiveFrames = function (frameData) {
	        // Can we have an interaction_method of 'checkboxes' but not a type of 'matching'?
	        var result;
	        if (frameData.interaction_method === 'checkboxes') {
	            result = this.createCheckboxTable(frameData);
	        }
	        return result;
	    };
	    Matching.prototype.createCheckboxTable = function (frameData) {
	        var result;
	        result = { blanks: '', answer: '', submission: '' };
	        var $ = this.$;
	        var MathJax = this.MathJax;
	        var problemData = this.data;
	        var config = this.config;
	        var table = $("<table class='matching'></table>");
	        var o = frameData.column_row_vals;
	        var tObj = {}, row, rowCount = 0;
	        var idCount = 0;
	        for (var i in o) {
	            var arr = o[i];
	            rowCount = 0;
	            arr.forEach(function (value) {
	                if (!tObj[rowCount]) {
	                    tObj[rowCount] = $("<tr class='table-row'></tr>").appendTo(table);
	                }
	                row = tObj[rowCount];
	                if (value == null) {
	                    row.append("<td type='text' class='table-cell'><div id='" + idCount + "' class='ansChoice mcms'>✓</div></td>");
	                    idCount++;
	                }
	                else {
	                    if (typeof value === 'string' || value instanceof String) {
	                        if ((value).indexOf('img') != -1) {
	                            var img = new Image();
	                            img.onload = function () {
	                                //q.css({
	                                //	width: "calc(100% - " + (img.width + 20) + "px)",
	                                // position:"absolute",
	                                //});
	                            };
	                            var temp = (value.split(':')[1]).trim();
	                            img.src = config.imgSrc + (temp).substring(0, temp.length - 1);
	                            row.append("<td type='text' class='table-cell'></td>");
	                            (row.find('.table-cell')[0]).append(img);
	                        }
	                        else {
	                            row.append("<td type='text' class='table-cell'>" + (value == "<>" ? "" : value) + "</td>");
	                        }
	                    }
	                    else {
	                        row.append("<td type='text' class='table-cell'>" + (value == "<>" ? "" : value) + "</td>");
	                    }
	                    var math = row[0];
	                    try {
	                        if ((value).indexOf('</math>') != -1) {
	                            MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
	                        }
	                    }
	                    catch (e) {
	                        console.log('Error in createCheckboxTable', value, e);
	                    }
	                }
	                rowCount++;
	            });
	        }
	        ;
	        if (frameData.header_rows) {
	            frameData.header_rows.forEach(function (value) {
	                table.find("tr:nth-child(" + (value + 1) + ")").addClass("table-header");
	            });
	        }
	        if (frameData.header_cols) {
	            frameData.header_cols.forEach(function (value) {
	                table.find("td:nth-child(" + (value + 1) + ")").addClass("table-header");
	            });
	        }
	        result.blanks = $(table)[0].outerHTML;
	        if (this.data.a) {
	            var answer = $(table).clone();
	            this.correctAnswers.forEach(function (item) {
	                $(answer).find('div[id=' + item + ']').addClass('checked');
	            });
	            result.answer = $(answer)[0].outerHTML;
	        }
	        if (this.data.orig_submission) {
	            var submission = $(table).clone();
	            this.submittedAnswers.forEach(function (item) {
	                $(submission).find('div[id=' + item + ']').addClass('checked');
	            });
	            result.submission = $(submission)[0].outerHTML;
	        }
	        return result;
	    };
	    Matching.prototype.parseAnswerIndexes = function (a) {
	        var arr = a.split(',');
	        arr = arr.map(function (item) { return parseInt(item, 10); });
	        return arr;
	    };
	    return Matching;
	}(eoc_1.default));
	exports.default = Matching;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Select Text/ Multi select
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	/*
	    This class should handle select-text as well as multichoice template.
	    Only thing differs is config.class.
	    config.class : mcms      -- for multichoice
	    config.class : mcss      -- for single select/ select-text
	*/
	var SelectText = /** @class */ (function (_super) {
	    __extends(SelectText, _super);
	    function SelectText(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.config = config;
	            _this.correctAnswers = _this.parseAnswerIndexes(data.a);
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    SelectText.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: 'selectText', code: this.formatSelectText() },
	            { name: this.data["presentation_data"].interactive_frames[0].style, code: "" },
	            //            { name: "question", code: this.formatQue() },
	            { name: "blank", code: this.formatQue() },
	            { name: 'submission', code: this.formatSub() },
	            { name: 'choices', code: this.formatChoices() },
	            { name: 'answer', code: this.formatAns() }
	        ] : [];
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    SelectText.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = blockObj.code;
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	            $(block).appendTo(_this.config.dom.ansContainer);
	        });
	        var ansList = this.config.dom.el.find("." + this.config.class);
	        return {
	            ansList: ansList
	        };
	    };
	    //---------- PRIVATE ----------
	    SelectText.prototype.buildAnsTemplate = function () {
	        return "\n<div class=\"ansContainer\">\n  <div class=\"frameTitle\">__TITLE__</div>\n  <ul class=\"ansList\" name=\"selectable-hot-text\">\n    __CHOICES__\n  </ul>\n</div>\n";
	    };
	    SelectText.prototype.makeImgTag = function (text) {
	        var temp = (text.split(':')[1]).trim();
	        var src = this.config.imgSrc + (temp).substring(0, temp.length - 1);
	        var imgTag = '<img src="' + src + '" style="pointer-events: none">';
	        return imgTag;
	    };
	    SelectText.prototype.formatSelectText = function () {
	        return this.frames[0].blanks;
	    };
	    SelectText.prototype.formatSub = function () {
	        var sub = this.frames[0].submission || '';
	        return sub;
	    };
	    SelectText.prototype.formatChoices = function () {
	        return this.frames[0].choices;
	    };
	    SelectText.prototype.formatAns = function () {
	        return this.frames[0].answer;
	    };
	    SelectText.prototype.formatQue = function () {
	        return this.data.presentation_data.interactive_frames[0].text;
	    };
	    SelectText.prototype.createInteractiveFrames = function (frameData) {
	        var result;
	        this.partNdx = this.getPartNdx(frameData);
	        if (frameData.interaction_method === 'select_elements_single' || frameData.interaction_method === 'checkbox_selection') {
	            result = this.createSelectTextBox();
	        }
	        return result;
	    };
	    SelectText.prototype.buildChoices = function (selected) {
	        var _this = this;
	        var result;
	        var li = [];
	        var choices = [];
	        var keys = Object.keys(this.data.presentation_data.answer_val_map);
	        keys.forEach(function (ndx) {
	            var classes = 'ansChoice mcss pDisable';
	            var item = _this.data.presentation_data.answer_val_map[ndx];
	            if (ndx == selected)
	                classes += ' selected';
	            li.push('<li class="' + classes + '">' + item + '</li>');
	            choices.push(item);
	        });
	        result = { ul: li.join(''), choices: choices };
	        return result;
	    };
	    SelectText.prototype.createSelectTextBox = function () {
	        var _this = this;
	        var result;
	        result = { blanks: '', answer: '', submission: '', choices: [] };
	        var $ = this.$;
	        var MathJax = this.MathJax;
	        var ansList = $("<ul class='ansList' name='selectable-hot-text'></ul>");
	        var choices = [];
	        this.$.each(this.answer_val_map, function (choice, val) {
	            // ansList.append("<li class='ansChoice " + this.config.class + "' data-id=" + choice + ">" + this.answer_val_map[choice] + "</li>");
	            var val = _this.answer_val_map[choice];
	            if ((typeof val === 'string' || val instanceof String) && (val).indexOf('img') != -1) {
	                var temp = (val.split(':')[1]).trim();
	                var src = _this.config.imgSrc + (temp).substring(0, temp.length - 1);
	                var imgTag = '<img src="' + src + '" style="pointer-events: none">';
	                var dataEle = $("<li class='ansChoice  " + _this.config.class + "' data-id=" + choice + "></li>");
	                choices.push(imgTag);
	                dataEle.append(imgTag);
	                ansList.append(dataEle);
	            }
	            else {
	                choices.push(val);
	                ansList.append("<li class='ansChoice  " + _this.config.class + "' data-id=" + choice + ">" + val + "</li>");
	            }
	        });
	        result.blanks = $(ansList)[0].outerHTML;
	        result.choices = choices;
	        if (this.data.a) {
	            var choiceObj = this.buildChoices(this.data.a);
	            var answer = this.buildAnsTemplate();
	            answer = answer.replace('__TITLE__', this.data.presentation_data.interactive_frames[0].text);
	            answer = answer.replace('__ID__', this.partNdx);
	            answer = answer.replace('__CHOICES__', choiceObj.ul);
	            result.answer = answer;
	        }
	        // Add submission block regardless of presence of submission
	        var _sub = (typeof this.orig_submission !== 'string') ? this.orig_submission[this.partNdx] : this.orig_submission;
	        choiceObj = this.buildChoices(_sub);
	        var submission = this.buildAnsTemplate();
	        submission = submission.replace('__TITLE__', this.data.presentation_data.interactive_frames[0].text);
	        submission = submission.replace('__ID__', this.partNdx);
	        submission = submission.replace('__CHOICES__', choiceObj.ul);
	        result.submission = submission;
	        return result;
	    };
	    SelectText.prototype.parseAnswerIndexes = function (a) {
	        var arr = a.split(',');
	        arr = arr.map(function (item) { return parseInt(item, 10); });
	        return arr;
	    };
	    return SelectText;
	}(eoc_1.default));
	exports.default = SelectText;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Open Response
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var helper_1 = __webpack_require__(4);
	var OpenResponse = /** @class */ (function (_super) {
	    __extends(OpenResponse, _super);
	    function OpenResponse(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        var frames = [];
	        _this.$ = config.inject && config.inject.$ || {};
	        _this.MathJax = config.inject && config.inject.MathJax || {};
	        _this.CKEDITOR = config.inject && config.inject.CKEDITOR || {};
	        _this.config = config;
	        frames.push(_this.createInteractiveFrames());
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    OpenResponse.prototype.getBlocks = function () {
	        var blocks = [
	            { name: 'prompt', code: this.formatPrompt() },
	            { name: 'essayBlock', code: this.formatEssayBlock() },
	            { name: this.data["presentation_data"].interactive_frames[0].style, code: "" },
	            { name: "blank", code: this.formatBlank() },
	            { name: 'submission', code: this.formatSub() },
	            { name: 'answer', code: this.formatAns() }
	        ];
	        console.log('open response blocks', this.probID, blocks);
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    OpenResponse.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block;
	            if (blockObj.name === "essayBlock") {
	                block = _this.box;
	            }
	            else {
	                block = blockObj.code;
	            }
	            _this.$(block).appendTo(_this.config.dom.ansContainer);
	        });
	        return {
	            box: this.config.dom.el.find("." + this.config.classes.essay)
	        };
	    };
	    //---------- PRIVATE ----------
	    OpenResponse.prototype.formatPrompt = function () {
	        return this.frames[0].prompt;
	    };
	    OpenResponse.prototype.formatEssayBlock = function () {
	        return this.frames[0].box;
	    };
	    OpenResponse.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    OpenResponse.prototype.formatAns = function () {
	        return this.frames[0].answer;
	    };
	    OpenResponse.prototype.formatBlank = function () {
	        return this.data.presentation_data.interactive_frames[0].text;
	    };
	    OpenResponse.prototype.createInteractiveFrames = function () {
	        var result;
	        result = this.createInputArea();
	        return result;
	    };
	    OpenResponse.prototype.answerTemplate = function (frameClass, prompt, answer) {
	        var template = "\n<div class=\"ansContainer\" data-type=\"essay\">\n  <div class=\"frameTitle\">" + prompt + "</div>\n  <div class=\"" + frameClass + "\">" + answer + "</div>\n</div>";
	        return template;
	    };
	    OpenResponse.prototype.createInputArea = function () {
	        var result;
	        result = { prompt: '', box: '', answer: '', submission: '' };
	        var $ = this.$;
	        var MathJax = this.MathJax;
	        var input = this.$("<textarea placeholder='Enter your answer' class='essay'></textarea>");
	        var preview = this.$("<div class='previewEssay' style='width:100%;background-color: #ebebe4;'></div>");
	        var frame = this.interactive_frames[0];
	        var partNdx = this.getPartNdx(frame);
	        result.prompt = frame.text;
	        if (this.CKEDITOR.replace) {
	            if (this.config.ckeditorMitrPresets) {
	                this.config.editor = this.CKEDITOR.replace(input[0], this.config.ckeditorMitrPresets);
	            }
	            else {
	                this.config.editor = this.CKEDITOR.replace(input[0]);
	            }
	        }
	        else {
	            this.config.editor = {};
	        }
	        this.box = input[0];
	        result.box = input[0].outerHTML;
	        if (this.data.a) {
	            preview.html(this.answerTemplate('frameAnswer OpenResponse', frame.text, helper_1.cleanEntities(this.data["a"])));
	            result.answer = preview[0].outerHTML;
	        }
	        if (this.orig_submission) {
	            var _sub = (typeof this.orig_submission !== 'string') ? helper_1.cleanEntities(this.orig_submission[partNdx]) : helper_1.cleanEntities(this.orig_submission);
	            var _preview = this.$(preview).clone();
	            _preview.html(this.answerTemplate('frameSubmission OpenResponse', frame.text, _sub));
	            result.submission = _preview[0].outerHTML;
	        }
	        else {
	            _preview = this.$(preview).clone();
	            _preview.html(this.answerTemplate('frameSubmission OpenResponse', frame.text, ''));
	            result.submission = _preview[0].outerHTML;
	        }
	        return result;
	    };
	    return OpenResponse;
	}(eoc_1.default));
	exports.default = OpenResponse;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Editing Task
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var EditingTask = /** @class */ (function (_super) {
	    __extends(EditingTask, _super);
	    function EditingTask(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        _this.buttonNames = ["fraction", "power", "base", "round-brackets", "mod", "sqrt", "root", "pi"];
	        _this.button_meta = { "1": { latex: "1", }, "2": { latex: "2", }, "3": { latex: "3", }, "a": { latex: "a", }, "n": { latex: "n", }, "4": { latex: "4", }, "5": { latex: "5", }, "6": { latex: "6", }, "+": { latex: "+", }, "emdash": { latex: "-", }, "dot": { latex: "&#x2022", }, "divide": { latex: "\\div", }, "7": { latex: "7", }, "8": { latex: "8", }, "9": { latex: "9", }, "lt": { latex: "\\lt", }, "lte": { latex: "\\leq", }, "eq": { latex: "=", }, "gte": { latex: "\\geq", }, "gt": { latex: "\\gt", }, "0": { latex: "0", }, ".": { latex: ".", }, "-": { latex: "&#8208", }, "fraction": { latex: "\\frac{}{}" }, "sqrt": { latex: "\\sqrt{}", moveto: "Left", }, "root": { latex: "\\sqrt[{}]{}", moveto: "Left", movefor: 2, }, "power": { latex: "\\^{}", }, "base": { latex: "\\_{}", moveto: "Down", }, "round-brackets": { latex: "\\left(\\right)", moveto: "Left", }, "pi": { latex: "\\pi", }, "mod": { latex: "\\left|\\right|", moveto: "Left", } };
	        _this.input = $("<div class='equation-input'></div>");
	        _this.arrow = $("<div class='edit-arrow'></div>");
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.MathQuill = config.inject && config.inject.MathQuill || {};
	            _this.config = config;
	            _this.correctAnswers = _this.data.a;
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    EditingTask.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: 'editingTask', code: this.formatSentenceBox() },
	            { name: this.data["presentation_data"].interactive_frames[0].style, code: "" },
	            { name: "blank", code: this.formatQue() },
	            { name: "question", code: this.formatQue() },
	            { name: 'answer', code: this.formatAnswer() },
	            { name: 'submission', code: this.formatSub() },
	            { name: 'box', code: this.formatEditingBox() }
	        ] : [];
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    EditingTask.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = problemBlocks[key].code;
	            if (problemBlocks[key].name === 'box') {
	                $(block).appendTo(_this.config.dom.el);
	            }
	            else {
	                $(block).appendTo(_this.config.dom.ansContainer);
	            }
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	        });
	        var box = this.config.dom.el.find("." + this.config.classes.box);
	        var input = this.config.dom.el.find("." + this.config.classes.eqInput);
	        var arrow = this.arrow;
	        return {
	            box: box,
	            mathField: this.mathField,
	            arrow: this.arrow,
	            input: input
	        };
	    };
	    //---------- PRIVATE ----------
	    EditingTask.prototype.formatEditingBox = function () {
	        return this.frames[0].box;
	    };
	    EditingTask.prototype.formatSentenceBox = function () {
	        return this.frames[0].blanks;
	    };
	    EditingTask.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    EditingTask.prototype.formatAnswer = function () {
	        return this.frames[0].answer;
	    };
	    EditingTask.prototype.formatQue = function () {
	        return this.data.presentation_data.interactive_frames[0].text;
	    };
	    EditingTask.prototype.createInteractiveFrames = function (frameData) {
	        var result;
	        if (frameData.interaction_method === 'inline_text_editing') {
	            result = this.createEditingBox(frameData);
	        }
	        return result;
	    };
	    // Generate drop indicator pattern. This one's ugly and so is in its own function.
	    EditingTask.prototype.getDropIndicatorPattern = function (dropIndicator) {
	        var patternStr = dropIndicator
	            .replace('[', '\\[')
	            .replace(']', '\\]')
	            .replace(/\|/g, '\\|')
	            .replace('%id', '(.+?)');
	        var pattern = new RegExp(patternStr, 'ig'); //\|\[(.+?)\]\|/ig;
	        return pattern;
	    };
	    EditingTask.prototype.createEditingBox = function (frameData) {
	        var _this = this;
	        var result;
	        result = { blanks: '', answer: '', box: '', submission: '' };
	        var $ = this.$;
	        var MathJax = this.MathJax;
	        var frameBox = $("<div class='" + frameData.interaction_method + "'></div>");
	        if (frameData.title_display) {
	            frameBox.append("<div class='frameTitle'>" + frameData.title + "</div>");
	        }
	        var pattern = this.getDropIndicatorPattern(frameData.drop_indicator);
	        var text = frameData.text.split(pattern);
	        var i = 1;
	        var l = text.length;
	        for (; i < l; i += 2) {
	            var o = frameData.contents[text[i]];
	            text[i] = "<div class='editable' data-latex='" + o.data.split(" ").join(" \\space ") + "'>$" + o.data.split(" ").join(" \\space ") + "$</div>";
	        }
	        frameBox.append(text);
	        var box = $("<div class='edit-box'></div>").append("<span style='font-style:italic;font-size:15px;'>Type in the correct word or phrase that must replace the incorrect word/phrase.</span>");
	        var row = $("<div class='eq-button-row'></div>").appendTo(box).css({
	            "bottom": "35px",
	            "position": "absolute"
	        });
	        this.buttonNames.forEach(function (value, i) {
	            row.append("<div class='eqButton' data-latex='" + _this.button_meta[value].latex + "' data-moveto='" + _this.button_meta[value].moveto + "' data-movefor='" + _this.button_meta[value].movefor + "' data-name='" + value + "'></div>");
	        });
	        box.append("<div class='rect-button ok'>OK</div><div class='rect-button cancel'>Cancel</div>").append(this.input).append(this.arrow);
	        result.blanks = frameBox[0].outerHTML;
	        result.box = box[0].outerHTML;
	        if (this.data.a) {
	            var answerText = frameData.text.split(pattern);
	            var answer = $(frameBox).clone();
	            var j = 1;
	            var l_1 = answer.length;
	            var count = 0;
	            for (; j < j; i += 2) {
	                answerText[j] = "<div class='editable' data-latex=''>" + this.correctAnswers[count] + "</div>";
	                count++;
	            }
	            result.answer = $(answer)[0].outerHTML;
	        }
	        if (this.orig_submission) {
	            var answerText = frameData.text.split(pattern);
	            var answer = $(frameBox).clone();
	            var j = 1;
	            var l_2 = answer.length;
	            var count = 0;
	            for (; j < j; i += 2) {
	                answerText[j] = "<div class='editable' data-latex=''>" + this.orig_submission[count] + "</div>";
	                count++;
	            }
	            result.submission = $(answer)[0].outerHTML;
	        }
	        return result;
	    };
	    return EditingTask;
	}(eoc_1.default));
	exports.default = EditingTask;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Editing Task Choice
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var EditingTaskChoice = /** @class */ (function (_super) {
	    __extends(EditingTaskChoice, _super);
	    function EditingTaskChoice(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.MathQuill = config.inject && config.inject.MathQuill || {};
	            _this.config = config;
	            _this.correctAnswers = _this.data.a;
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    EditingTaskChoice.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { file: 'editingTaskChoice', style: this.data["presentation_data"].interactive_frames[0].style, code: '' },
	            { name: "question", code: this.formatQue() },
	            { name: "blank", code: this.formatQue() },
	            { name: 'answer', code: this.formatAns() },
	            { name: 'submission', code: this.formatSub() }
	        ] : [];
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    EditingTaskChoice.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = problemBlocks[key].code;
	            $(block).appendTo(_this.config.dom.ansContainer);
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	        });
	    };
	    //---------- PRIVATE ----------
	    EditingTaskChoice.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    EditingTaskChoice.prototype.formatAns = function () {
	        return this.frames[0].answer;
	    };
	    EditingTaskChoice.prototype.formatQue = function () {
	        return this.frames[0].blanks;
	    };
	    EditingTaskChoice.prototype.createInteractiveFrames = function (frameData) {
	        var result;
	        if (frameData.interaction_method === 'text_select_dropdown') {
	            result = this.createEditingBox(frameData);
	        }
	        return result;
	    };
	    // Generate drop indicator pattern. This one's ugly and so is in its own function.
	    EditingTaskChoice.prototype.getDropIndicatorPattern = function (dropIndicator) {
	        var patternStr = dropIndicator
	            .replace('[', '\\[')
	            .replace(']', '\\]')
	            .replace(/\|/g, '\\|')
	            .replace('%id', '(.+?)');
	        var pattern = new RegExp(patternStr, 'ig'); //\|\[(.+?)\]\|/ig;
	        return pattern;
	    };
	    EditingTaskChoice.prototype.createEditingBox = function (frameData) {
	        var result;
	        result = { blanks: '', answer: '', box: '', submission: '', choices: [] };
	        var $ = this.$;
	        var MathJax = this.MathJax;
	        var frameBox = $("<div class='" + frameData.interaction_method + "'></div>");
	        if (frameData.title_display) {
	            frameBox.append("<div class='frameTitle'>" + frameData.title + "</div>");
	        }
	        var pattern = this.getDropIndicatorPattern(frameData.drop_indicator);
	        var text = frameData.text.split(pattern);
	        var i = 1, l = text.length;
	        var choiceId = 0;
	        for (; i < l; i += 2) {
	            text[i] = "<div class='inline-choice' data-id='" + choiceId + "'><span>" + String.fromCharCode(65 + choiceId) + "</span></div>";
	            choiceId++;
	        }
	        frameBox.append(text);
	        var extrasWrapper = $('<div class="extras-wrapper"></div>');
	        var div = $("<div></div>").css({
	            position: "absolute",
	            left: 0,
	            top: 0
	        }).appendTo(this.config.dom.ansContainer);
	        var _choices = frameBox.find(".inline-choice");
	        var ansMap = this.answer_val_map;
	        _choices.each(function (i, ele) {
	            var list = $("<div class='task_choice_list'></div>").appendTo(ele);
	            list.append('<div class="list_item">' + String.fromCharCode(65 + i) + '</div>').appendTo(extrasWrapper);
	            var maxWidth = 0;
	            frameData.box_selection_answer_options[i].forEach(function (c, j) {
	                $("<div class='list_item' data-id = '" + c + "'>" + ansMap[c] + "</div>").appendTo(list);
	                div.html(ansMap[c]);
	                maxWidth = Math.max(div.width(), maxWidth);
	            });
	            $(ele).width(maxWidth);
	        });
	        div.remove();
	        $('<br style="clear:both">').appendTo(extrasWrapper);
	        result.blanks = '<div class="ansContainer task_choice" data-type="editing_task_choice">' + frameBox[0].outerHTML + extrasWrapper[0].outerHTML + '</div>';
	        if (this.data.a) {
	            var answer = $(frameBox).clone();
	            var submission = $(frameBox).clone();
	            var ans = [];
	            var sub = [];
	            var _subNdx = this.data.submission.split(',');
	            this.data.a.split(',').forEach(function (i, ndx) {
	                ans.push(+(i));
	                if (_subNdx[ndx]) {
	                    sub.push(+(_subNdx[ndx]));
	                }
	                else {
	                    sub.push(-1);
	                }
	            });
	            var j = 0, l = ans.length;
	            for (; j < l; j++) {
	                $(answer).find('.inline-choice')[j].innerHTML = this.answer_val_map[ans[j]];
	                $(submission).find('.inline-choice')[j].innerHTML = this.answer_val_map[sub[j]] || '';
	            }
	            result.answer = '<div class="ansContainer task_choice" data-type="editing_task_choice">' + $(answer)[0].outerHTML + '</div>';
	            result.submission = '<div class="ansContainer task_choice" data-type="editing_task_choice">' + $(submission)[0].outerHTML + '</div>';
	        }
	        /*
	                if (this.orig_submission) {
	                    var answer = $(frameBox).clone();
	                    var ans = [];
	                    this.orig_submission.split(',').forEach((i) => { ans.push(+(i)) });
	                    var j: any = 0, l: any = ans.length;
	                    for (; j < l; j++) {
	                        $(answer).find('.inline-choice')[j].innerHTML = this.answer_val_map[ans[j]];
	                    }
	                    result.submission = '<div class="ansContainer task_choice" data-type="editing_task_choice">' + $(answer)[0].outerHTML + '</div>';
	        //            result.submission = $(answer)[0].outerHTML;
	                }
	        */
	        return result;
	    };
	    return EditingTaskChoice;
	}(eoc_1.default));
	exports.default = EditingTaskChoice;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Equation Editor
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var EquationEditor = /** @class */ (function (_super) {
	    __extends(EquationEditor, _super);
	    function EquationEditor(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        _this.button_meta = { "1": { latex: "1", }, "2": { latex: "2", }, "3": { latex: "3", }, "a": { latex: "a", }, "n": { latex: "n", }, "4": { latex: "4", }, "5": { latex: "5", }, "6": { latex: "6", }, "+": { latex: "+", }, "emdash": { latex: "-", }, "dot": { latex: "&#x2022", }, "divide": { latex: "\\div", }, "7": { latex: "7", }, "8": { latex: "8", }, "9": { latex: "9", }, "lt": { latex: "\\lt", }, "lte": { latex: "\\leq", }, "eq": { latex: "=", }, "gte": { latex: "\\geq", }, "gt": { latex: "\\gt", }, "0": { latex: "0", }, ".": { latex: ".", }, "-": { latex: "&#8208", }, "fraction": { latex: "\\frac{}{}" }, "sqrt": { latex: "\\sqrt{}", moveto: "Left", }, "root": { latex: "\\sqrt[{}]{}", moveto: "Left", movefor: 2, }, "power": { latex: "\\^{}", }, "base": { latex: "\\_{}", moveto: "Down", }, "round-brackets": { latex: "\\left(\\right)", moveto: "Left", }, "pi": { latex: "\\pi", }, "mod": { latex: "\\left|\\right|", moveto: "Left", } };
	        _this.controls = ["left", "right", "undo", "redo", "backspace"];
	        _this.buttonNames = [
	            ["1", "2", "3", "n", "a"],
	            ["4", "5", "6", "+", "emdash", "dot", "divide"],
	            ["7", "8", "9", "lt", "lte", "eq", "gte", "gt"],
	            ["0", ".", "fraction", "power", "base", "round-brackets", "mod", "sqrt", "root", "pi"]
	        ];
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.MathQuill = config.inject && config.inject.MathQuill || {};
	            _this.input = _this.$("<div class='equation-input'>&nbsp;</div>");
	            _this.config = config;
	            _this.correctAnswers = _this.data.a;
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    EquationEditor.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: 'eqBox', code: this.formateqBox() },
	            { name: 'submission', code: this.formatSub() },
	            { name: "blank", code: this.formatBlank() },
	            { name: 'answer', code: this.formatAns() }
	        ] : [];
	        console.log('equation-editor', this.probID, blocks);
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    EquationEditor.prototype.appendElements = function () {
	        var _this = this;
	        var that = this;
	        var problemBlocks = this.getBlocks();
	        that.$.each(problemBlocks, function (key, blockObj) {
	            var block = problemBlocks[key].code;
	            that.$(block).appendTo(_this.config.dom.ansContainer);
	            if (block.indexOf('</math>') != -1) {
	                that.MathJax.Hub.Queue(["Typeset", that.MathJax.Hub, block]);
	            }
	        });
	        var input = this.config.dom.el.find("." + this.config.classes.eqInput);
	        var btnContainer = this.config.dom.el.find("." + this.config.classes.btnContainer);
	        return {
	            input: input,
	            btnContainer: btnContainer
	        };
	    };
	    //---------- PRIVATE ----------
	    EquationEditor.prototype.formateqBox = function () {
	        return this.frames[0].box;
	    };
	    EquationEditor.prototype.formatAns = function () {
	        return this.frames[0].answer;
	    };
	    EquationEditor.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    EquationEditor.prototype.formatBlank = function () {
	        return this.frames[0].box;
	    };
	    EquationEditor.prototype.separateMathML = function (str) {
	        var _ans;
	        if (str.indexOf('math>|<math') !== -1) {
	            var delim = '^^^^^';
	            _ans = str.replace(/math>\|<math/g, 'math>' + delim + '<math');
	            _ans = (_ans).split(delim);
	        }
	        else {
	            _ans = (str).split('|');
	        }
	        return _ans;
	    };
	    EquationEditor.prototype.createInteractiveFrames = function (frameData) {
	        var result;
	        if (frameData.interaction_method === 'container_text_input') {
	            result = this.createEqBox(frameData);
	        }
	        return result;
	    };
	    EquationEditor.prototype.createEqBox = function (frameData) {
	        var _this = this;
	        var result;
	        result = { box: '', answer: '', submission: '' };
	        var that = this;
	        var MathJax = this.MathJax;
	        //        var frameBox = that.$("<div class='" + frameData.interaction_method + "'></div>");
	        var frameBox = that.$("<div class='ansContainer'></div>");
	        if (frameData.title_display) {
	            frameBox.append("<div class='frameTitle'>" + frameData.title + "</div>");
	        }
	        if (frameData.text) {
	            frameBox.append("<div class='frameTitle'>" + frameData.text + "</div>");
	            var math = frameBox[0];
	            if ((frameData.text).indexOf('</math>') != -1) {
	                MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
	            }
	        }
	        that.$.fn.textWidth = function (text, font) {
	            if (!that.$.fn.textWidth.fakeEl)
	                that.$.fn.textWidth.fakeEl = that.$('<span>').hide().appendTo(document.body);
	            that.$.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
	            return that.$.fn.textWidth.fakeEl.width();
	        };
	        that.$.each(frameData.contents, function (i, _data) {
	            if (_data.pre) {
	                frameBox.append("<div class='preText'>" + _data.pre + "</div>");
	                var math = frameBox.find('.preText')[i];
	                if ((_data.pre).indexOf('</math>') != -1) {
	                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
	                }
	            }
	            var inpClone = _this.input.clone().attr("data-index", i);
	            if (_data.inLine) {
	                var inlineContainer = that.$("<div class='inlineContainer'></div>");
	                inlineContainer.append("<div class='inlineText'>" + _data.inLine + "</div>");
	                inlineContainer.append(inpClone);
	                frameBox.append(inlineContainer);
	                var math_1 = inlineContainer.find('.inlineText')[0];
	                var width = that.$.fn.textWidth && that.$.fn.textWidth(math_1.innerText) || 500;
	                inlineContainer.find('.inlineText').css("width", width + 'px');
	                if ((_data.inLine).indexOf('</math>') != -1) {
	                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math_1]);
	                }
	            }
	            else if (_data.postInLine) {
	                var inlineContainer_1 = that.$("<div class='inlineContainer'></div>");
	                inlineContainer_1.append(inpClone);
	                inlineContainer_1.append("<div class='inlineText'>" + _data.postInLine + "</div>");
	                frameBox.append(inlineContainer_1);
	                var math = inlineContainer_1.find('.inlineText')[0];
	                var width = that.$.fn.textWidth(math.innerText);
	                inlineContainer_1.find('.inlineText').css({
	                    "width": (width + 8) + 'px',
	                    "text-align": "right"
	                });
	                if ((_data.postInLine).indexOf('</math>') != -1) {
	                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
	                }
	            }
	            else {
	                frameBox.append(inpClone);
	            }
	            if (_data.post) {
	                frameBox.append("<div class='.postText'>" + _data.post + "</div>");
	                var math = frameBox.find('.postText')[i];
	                if ((_data.pre).indexOf('</math>') != -1) {
	                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
	                }
	            }
	        });
	        this.controls.forEach(function (name) {
	            frameBox.append("<div class='eq-editor-controls' data-name='" + name + "'></div>");
	        });
	        var buttonContainer = that.$("<div class='eq-button-container'></div>").appendTo(frameBox);
	        that.$.each(this.buttonNames, function (i, arr) {
	            var row = that.$("<div class='eq-button-row'></div>").appendTo(buttonContainer);
	            arr.forEach(function (value, j) {
	                row.append("<div class='eqButton' data-latex='" + _this.button_meta[value].latex + "' data-movefor='" + _this.button_meta[value].movefor + "' data-moveto='" + _this.button_meta[value].moveto + "' data-name='" + value + "'></div>");
	            });
	        });
	        result.box = frameBox[0].outerHTML;
	        if (this.data.a) {
	            var answer = this.$(frameBox).clone();
	            var _ans = this.separateMathML(this.data.a);
	            this.$(answer).find('.' + this.config.classes.eqInput).each(function (i, _field) {
	                _field.innerHTML = _ans[i];
	            });
	            result.answer = this.$(answer)[0].outerHTML;
	        }
	        if (this.orig_submission) {
	            var answer = this.$(frameBox).clone();
	            var _ans = this.separateMathML(this.orig_submission);
	            this.$(answer).find('.' + this.config.classes.eqInput).each(function (i, _field) {
	                _field.innerHTML = _ans[i];
	            });
	            result.submission = this.$(answer)[0].outerHTML;
	        }
	        else {
	            result.submission = result.box;
	        }
	        return result;
	    };
	    return EquationEditor;
	}(eoc_1.default));
	exports.default = EquationEditor;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Table items
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var TableItems = /** @class */ (function (_super) {
	    __extends(TableItems, _super);
	    function TableItems(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.config = config;
	            _this.correctAnswers = _this.parseAnswerIndexes(data.a);
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    TableItems.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: 'table', code: this.formatTable() },
	            { name: this.data["presentation_data"].interactive_frames[0].style, code: "" },
	            { name: 'blank', code: this.formatQue() },
	            { name: 'submission', code: this.formatSub() },
	            { name: 'answer', code: this.formatAns() }
	        ] : [];
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    TableItems.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = blockObj.code;
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	            $(block).appendTo(_this.config.dom.ansContainer);
	        });
	    };
	    //---------- PRIVATE ----------
	    TableItems.prototype.formatTable = function () {
	        return this.frames[0].blanks;
	    };
	    TableItems.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    TableItems.prototype.formatAns = function () {
	        return this.frames[0].answer;
	    };
	    TableItems.prototype.formatQue = function () {
	        return this.frames[0].question;
	    };
	    TableItems.prototype.createInteractiveFrames = function (frameData) {
	        var result;
	        if (frameData.interaction_method === 'text_input_boxes') {
	            result = this.createTable(frameData);
	        }
	        return result;
	    };
	    TableItems.prototype.answerTemplate = function (prompt, table) {
	        var code = "\n<div class=\"ansContainer table_item\">\n  <div class=\"frameTitle\">" + prompt + "</div>\n  " + table + "\n</div>\n";
	        return code;
	    };
	    // Create pattern match for drop points. This was designed to match the drop_indicator |[%id]|
	    // The regular expression this is creating is /(.*?)\|\[(\d+)\]\|(.*?)/
	    // That is, match an integer within |[ ]|. Capture the integer, as well as any string before and after.
	    TableItems.prototype.makeDropRe = function (str) {
	        var patternStr = str.replace('%id', '(\\d+)');
	        patternStr = patternStr.replace(/\|/g, '\\|');
	        patternStr = patternStr.replace(/(\[|\])/g, '\\$1');
	        patternStr = '(.*?)' + patternStr + '(.*?)';
	        return new RegExp(patternStr);
	    };
	    TableItems.prototype.createTable = function (frameData) {
	        var result;
	        result = { blanks: '', answer: '', submission: '', question: '' };
	        var $ = this.$;
	        var table = $('<table class="table"></table>');
	        var o = frameData.column_row_vals;
	        var tObj = {};
	        var row;
	        var rowCount = 0;
	        var idCount = 0;
	        var text = frameData.text || '';
	        var pattern = this.makeDropRe(frameData.drop_indicator);
	        for (var i in o) {
	            var arr = o[i];
	            rowCount = 0;
	            arr.forEach(function (value) {
	                var match;
	                match = pattern.exec(value);
	                if (!tObj[rowCount]) {
	                    tObj[rowCount] = $("<tr class='table-row'></tr>").appendTo(table);
	                }
	                row = tObj[rowCount];
	                // It's possible that there won't be null values. If instead, numbered placeholders are used,
	                // perhaps there will also not be a need for idCount.
	                if (value === null) {
	                    row.append("<td type='text' class='table-cell'><input id='" + idCount + "' maxlength=6 type='text'></input></td>");
	                    idCount++;
	                }
	                else if (match) {
	                    var pre = match[1] || '';
	                    var fieldId = match[2] || '';
	                    var post = match[3] || ''; // currently not used.
	                    row.append("<td type='text' class='table-cell'>" + pre + "<input id='" + fieldId + "' maxlength=6 type='text'></input></td>");
	                    idCount++;
	                }
	                else {
	                    row.append("<td type='text' class='table-cell'>" + value + "</td>");
	                }
	                rowCount++;
	            });
	        }
	        ;
	        if (frameData.header_rows) {
	            frameData.header_rows.forEach(function (value) {
	                table.find("tr:nth-child(" + (value + 1) + ")").addClass("table-header");
	            });
	        }
	        if (frameData.header_cols) {
	            frameData.header_cols.forEach(function (value) {
	                table.find("td:nth-child(" + (value + 1) + ")").addClass("table-header");
	            });
	        }
	        var ansContainer = this.answerTemplate(text, $(table)[0].outerHTML);
	        result.question = this.data.presentation_data.interactive_frames[0].text || '';
	        result.blanks = $(ansContainer)[0].outerHTML;
	        if (this.data.a) {
	            var answer = $(ansContainer).clone();
	            this.correctAnswers.forEach(function (item, i) {
	                $(answer).find('input[id=' + i + ']').attr({
	                    "value": item,
	                    "disabled": true
	                });
	            });
	            result.answer = $(answer)[0].outerHTML;
	        }
	        if (this.orig_submission) {
	            if (typeof this.orig_submission === 'string') {
	                // orig_submission for table-items must be an array.
	                this.orig_submission = this.orig_submission.split(',');
	            }
	            var answer = $(ansContainer).clone();
	            this.orig_submission.forEach(function (item, i) {
	                $(answer).find('input[id=' + i + ']').attr({
	                    "value": item,
	                    "disabled": true
	                });
	            });
	            result.submission = $(answer)[0].outerHTML;
	        }
	        else {
	            var answer = $(ansContainer).clone();
	            result.submission = $(answer)[0].outerHTML;
	        }
	        return result;
	    };
	    TableItems.prototype.parseAnswerIndexes = function (a) {
	        var arr = a.split(',');
	        arr = arr.map(function (item) { return parseInt(item, 10); });
	        return arr;
	    };
	    return TableItems;
	}(eoc_1.default));
	exports.default = TableItems;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Drag And Drop 2
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var drag_and_drop_1 = __webpack_require__(2);
	var matching_item_1 = __webpack_require__(5);
	var select_text_1 = __webpack_require__(6);
	var open_response_1 = __webpack_require__(7);
	var editing_task_1 = __webpack_require__(8);
	var editing_task_choice_1 = __webpack_require__(9);
	var equation_editor_1 = __webpack_require__(10);
	var table_items_1 = __webpack_require__(11);
	var oldTypes_1 = __webpack_require__(13);
	var grid2_1 = __webpack_require__(14);
	var helper_1 = __webpack_require__(4);
	var MultiPart = /** @class */ (function (_super) {
	    __extends(MultiPart, _super);
	    function MultiPart(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        _this.data = {};
	        var frames = [];
	        _this.data = data;
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.config = config;
	            _this.multContainer = _this.$("<div class='multContainer' style='float: left;'></div>");
	            _this.config['classes'] = {
	                dropArea: 'drops',
	                draggableContainer: 'dragsC',
	                draggable: 'drags',
	                dropped: 'dropped'
	            };
	            _this.parts = _this.gatherParts(helper_1.JSONsafeParse(JSON.stringify(_this.interactive_frames)).json);
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PRIVATE ----------
	    // The purpose of getDelimiter is to allow the library to override the delimiter to be used with
	    // a particular problem part style. Specifically, for drag-and-drop styles, we will use a '|'.
	    // The choice of the pipe character is somewhat arbitrary: the main criterion is that it must be
	    // something other than a comma, since commas are used within answers and submissions to separate
	    // drag-and-drop items.
	    // Within drag-and-drop.ts, the pipe character is explicity defined as the delimiter.
	    MultiPart.prototype.getDelimiter = function (part) {
	        var altDelimiterStyles = {
	            'content_text_drop_box': '|',
	            'horizontal_content_box': '|',
	            'vertical_content_box': '|',
	            'standard_content_box': '|',
	            'content_drop_box': '|',
	            'equation_input_container_with_basic_calc': '|'
	        };
	        var currPart = part[0];
	        var style = currPart.style;
	        var delimiter = altDelimiterStyles[style] || currPart.delimiter;
	        return delimiter;
	    };
	    //---------- PUBLIC ----------
	    MultiPart.prototype.getParts = function () {
	        return this.parts;
	    };
	    MultiPart.prototype.gatherParts = function (_data) {
	        var _this = this;
	        var that = this;
	        var groupingObj = {};
	        var count = 0;
	        var group;
	        var previous_gID;
	        var part;
	        var prevPart;
	        var tempFramesObj = {};
	        var answerArr = [];
	        var submissionArr = [];
	        var c = 0;
	        if (this.data["a"].constructor != Array) {
	            this.data["a"] = (this.data["a"]).replace(/&quot;/g, '"');
	            this.data["a"] = helper_1.cleanEntities(this.data["a"]);
	        }
	        if (this.orig_submission.constructor != Array) {
	            this.orig_submission = (this.orig_submission).replace(/&quot;/g, '"');
	            this.orig_submission = helper_1.cleanEntities(this.orig_submission);
	        }
	        else if (this.orig_submission.constructor === Array) {
	            this.orig_submission.forEach(function (element, index) {
	                _this.orig_submission[index] = element.replace(/&quot;/g, '"');
	                _this.orig_submission[index] = helper_1.cleanEntities(_this.orig_submission[index]);
	            });
	        }
	        if (this.data["a"].indexOf("<math") != -1) {
	            this.data["a"] = this.data["a"].replace(/xmlns=\"/g, "xmlns=\\\"");
	            this.data["a"] = this.data["a"].replace(/MathML\"/g, "MathML\\\"");
	        }
	        if (this.orig_submission.indexOf("<math") != -1) {
	            this.orig_submission = this.orig_submission.replace(/xmlns=\"/g, "xmlns=\\\"");
	            this.orig_submission = this.orig_submission.replace(/MathML\"/g, "MathML\\\"");
	        }
	        var a = helper_1.JSONsafeParse("[" + this.data["a"] + "]").json;
	        if (!this.orig_submission) {
	            this.orig_submission = "";
	        }
	        var sub = typeof this.orig_submission === 'string' ? helper_1.JSONsafeParse("[" + this.orig_submission + "]").json : helper_1.JSONsafeParse(JSON.stringify(this.orig_submission)).json;
	        a.forEach(function (item, i) {
	            if (typeof item === 'string' && item.indexOf('</math>') != -1) {
	                a[i] = item.replace(/\\/g, '"');
	            }
	        });
	        sub.forEach(function (item, i) {
	            if (typeof item === 'string' && item.indexOf('</math>') != -1) {
	                sub[i] = item.replace(/\\/g, '"');
	            }
	        });
	        _data.forEach(function (i, index) {
	            if (i.group_id) {
	                if (answerArr[+(i.group_id)] === undefined) {
	                    answerArr[+(i.group_id)] = [];
	                    answerArr[+(i.group_id)].push(a[c]);
	                    c++;
	                }
	                else {
	                    answerArr[+(i.group_id)].push(a[c]);
	                    c++;
	                }
	            }
	            else {
	                var _i = +(i.part_id.split('_')[1]);
	                if (answerArr[_i] === undefined) {
	                    answerArr[_i] = [];
	                    answerArr[_i].push(a[c]);
	                    c++;
	                }
	            }
	        });
	        // Build submissionArr, but only if there are submissions.
	        c = 0;
	        if (sub.length > 0) {
	            _data.forEach(function (i, index) {
	                // Allow for the possibility that there is a sub array but that it doesn't contain a submission for every item in _data.
	                if (sub[c] !== undefined) {
	                    if (i.group_id) {
	                        if (submissionArr[+(i.group_id)] === undefined) {
	                            submissionArr[+(i.group_id)] = [];
	                            submissionArr[+(i.group_id)].push(sub[c]);
	                            c++;
	                        }
	                        else {
	                            submissionArr[+(i.group_id)].push(sub[c]);
	                            c++;
	                        }
	                    }
	                    else {
	                        var _i = +(i.part_id.split('_')[1]);
	                        if (submissionArr[_i] === undefined) {
	                            submissionArr[_i] = [];
	                            submissionArr[_i].push(sub[c]);
	                            c++;
	                        }
	                    }
	                }
	            });
	        }
	        _data.forEach(function (i) {
	            prevPart = part;
	            part = i.part_id;
	            previous_gID = group;
	            group = i.group_id;
	            if (previous_gID == group && group != undefined) {
	                if ("undefined" === typeof (tempFramesObj[prevPart])) {
	                    var tempArr = [];
	                    tempArr.push(i);
	                    tempFramesObj[prevPart] = tempArr;
	                    count++;
	                }
	                else {
	                    if (i.column_row_vals) {
	                        tempFramesObj[prevPart].forEach(function (j) {
	                            _this.$.extend(j.column_row_vals, i.column_row_vals);
	                            i.contents.forEach(function (k) {
	                                (j.contents).push(k);
	                            });
	                        });
	                    }
	                    else {
	                        tempFramesObj[prevPart].forEach(function (j) {
	                            i.contents.forEach(function (k) {
	                                (j.contents).push(k);
	                            });
	                        });
	                        tempFramesObj[prevPart].push(i);
	                    }
	                    part = prevPart;
	                }
	            }
	            else {
	                if (prevPart == part) {
	                    tempFramesObj[prevPart].push(i);
	                }
	                else {
	                    if ("undefined" !== typeof (tempFramesObj[part])) {
	                        tempFramesObj[part].push(i);
	                    }
	                    else if ("undefined" === typeof (tempFramesObj["part_" + count])) {
	                        var tempArr = [];
	                        tempArr.push(i);
	                        tempFramesObj["part_" + count] = tempArr;
	                        count++;
	                    }
	                    else {
	                        tempFramesObj["part_" + count].push(i);
	                    }
	                }
	            }
	        });
	        console.log("******tempFramesObj", tempFramesObj);
	        var blocks = {};
	        var obj = helper_1.JSONsafeParse(JSON.stringify(this.data)).json;
	        var answer_val_map = this.answer_val_map || {};
	        Object.keys(tempFramesObj).forEach(function (key, index) {
	            var currPart = tempFramesObj[key];
	            var config = _this.config;
	            var eoc;
	            var el = _this.multContainer;
	            var partContainer = _this.$("<div class='partContainer'></div>");
	            config['dom'] = {
	                el: el,
	                ansContainer: partContainer
	            };
	            // Get delimiter from first element in current part.
	            var delim = _this.getDelimiter(currPart);
	            obj["a"] = !answerArr[index] ? '' : answerArr[index].join(delim);
	            obj["submission"] = !submissionArr[index] ? '' : submissionArr[index].join(delim);
	            obj["orig_submission"] = !submissionArr[index] ? '' : submissionArr[index].join(delim);
	            obj["presentation_data"]["interactive_frames"] = currPart;
	            obj["presentation_data"]["answer_val_map"] = answer_val_map[key];
	            switch (obj["presentation_data"].interactive_frames[0].style) {
	                case "multiple_choice_checkbox_selection":
	                    config['class'] = "mcms";
	                    eoc = new select_text_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "borderless_single_selection_box":
	                    config['class'] = "mcss";
	                    eoc = new select_text_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "equation_input_container_with_advanced_calc":
	                    config['classes'] = {
	                        eqInput: 'equation-input',
	                        btnContainer: 'eq-button-container'
	                    };
	                    eoc = new equation_editor_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "equation_input_container_with_basic_calc":
	                    config['classes'] = {
	                        eqInput: 'equation-input',
	                        btnContainer: 'eq-button-container'
	                    };
	                    eoc = new equation_editor_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "content_text_drop_box":
	                    config['classes'] = {
	                        dropArea: 'drops',
	                        draggableContainer: 'dragsC',
	                        draggable: 'drags',
	                        dropped: 'dropped'
	                    };
	                    eoc = new drag_and_drop_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "horizontal_content_box":
	                    config['classes'] = {
	                        dropArea: 'drops',
	                        draggableContainer: 'dragsC',
	                        draggable: 'drags',
	                        dropped: 'dropped'
	                    };
	                    eoc = new drag_and_drop_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "vertical_content_box":
	                    config['classes'] = {
	                        dropArea: 'drops',
	                        draggableContainer: 'dragsC',
	                        draggable: 'drags',
	                        dropped: 'dropped'
	                    };
	                    eoc = new drag_and_drop_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "standard_content_box":
	                    config['classes'] = {
	                        dropArea: 'drops',
	                        draggableContainer: 'dragsC',
	                        draggable: 'drags',
	                        dropped: 'dropped'
	                    };
	                    eoc = new drag_and_drop_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "content_drop_box":
	                    config['classes'] = {
	                        dropArea: 'drops',
	                        draggableContainer: 'dragsC',
	                        draggable: 'drags',
	                        dropped: 'dropped'
	                    };
	                    eoc = new drag_and_drop_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "text_edit_fix_box":
	                    config['classes'] = {
	                        box: 'edit-box',
	                        eqInput: 'equation-input'
	                    };
	                    eoc = new editing_task_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "text_select_dropdown_edit_box":
	                    eoc = new editing_task_choice_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "checkbox_grid_table":
	                    eoc = new matching_item_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "input_grid_table":
	                    eoc = new table_items_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "open_response":
	                    config['classes'] = {
	                        essay: 'essay'
	                    };
	                    eoc = new open_response_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "no input":
	                    eoc = new oldTypes_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "input":
	                    eoc = new oldTypes_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "radio":
	                    eoc = new oldTypes_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "check":
	                    eoc = new oldTypes_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "MultKinetic":
	                    eoc = new oldTypes_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                case "grid2":
	                    eoc = new grid2_1.default(obj, config);
	                    blocks[key] = eoc.getBlocks();
	                    break;
	                default:
	                    blocks[key] = [
	                        { name: obj["presentation_data"].interactive_frames[0].style, code: '<div>undefined type</div>' },
	                        { name: "question", code: obj["presentation_data"].interactive_frames[0].text },
	                        { name: "blank", code: obj["presentation_data"].interactive_frames[0].text },
	                        { name: "answer", code: _this.data["orig_a"] },
	                        { name: "submission", code: _this["orig_submission"] }
	                    ];
	                    break;
	            }
	            try {
	                blocks[key].title = currPart[0].title;
	            }
	            catch (e) {
	                blocks[key].title = '';
	            }
	        });
	        console.log("\\\\\\blocks ", this.probID, blocks);
	        return blocks;
	    };
	    return MultiPart;
	}(eoc_1.default));
	exports.default = MultiPart;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * OldTypes
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var helper_1 = __webpack_require__(4);
	var OldTypes = /** @class */ (function (_super) {
	    __extends(OldTypes, _super);
	    function OldTypes(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        _this.frames = [];
	        _this.$ = config.inject && config.inject.$ || {};
	        _this.MathJax = config.inject && config.inject.MathJax || {};
	        _this.MathQuill = config.inject && config.inject.MathQuill || {};
	        _this.config = config;
	        _this.cleanedData = _this.cleanMML(data);
	        _this.frames.push(_this.createFrame());
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    OldTypes.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: this.cleanedData["presentation_data"].interactive_frames[0].style, code: "" },
	            { name: 'blank', code: this.formatQue() },
	            { name: 'inputBox', code: this.formatInput() },
	            { name: 'answer', code: this.formatAns() },
	            { name: 'submission', code: this.formatSub() }
	        ] : [];
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    OldTypes.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = blockObj.code.blanks;
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	            _this.$(block).appendTo(_this.config.dom.ansContainer);
	        });
	    };
	    //---------- PRIVATE ----------
	    OldTypes.prototype.buildSubTemplate = function () {
	        return "\n<div class=\"ansContainer\">\n  <div class=\"frameTitle\">__Q__</div>\n  <div class=\"__CLASSES__\">__SUB__</div>\n</div>\n";
	    };
	    OldTypes.prototype.buildAnsTemplate = function () {
	        return "\n<div class=\"ansContainer\">\n  <div class=\"frameTitle\">__Q__</div>\n  <div class=\"__CLASSES__\">__A__</div>\n</div>\n";
	    };
	    OldTypes.prototype.buildCheckboxTemplate = function () {
	        var checkboxTemplate = "\n<div class=\"__CLASSES__\" data-id=\"__ID__\">\n    <div class=\"tableCell\">\n        <div class=\"bRadioBtn\"><div class=\"radioSelect\">\u2713</div></div>\n    </div>\n    <div class=\"bRadioText\">__TEXT__</div>\n</div>\n";
	        return checkboxTemplate;
	    };
	    OldTypes.prototype.formatCheckboxes = function (a, avm, ndx, context) {
	        var _this = this;
	        a = '' + a;
	        var key = 'part_' + ndx;
	        var classList = ['bOptionRow', 'pDisable'];
	        var rows = [];
	        avm.forEach(function (item) {
	            var classes = classList.join(' ');
	            if (context !== 'question' && a.indexOf(item.id) !== -1)
	                classes += ' selected';
	            var checkboxTemplate = _this.buildCheckboxTemplate();
	            var row = checkboxTemplate.replace('__ID__', item.id);
	            row = row.replace('__TEXT__', item.answer);
	            row = row.replace('__CLASSES__', classes);
	            rows.push(row);
	        });
	        return rows.join('');
	    };
	    OldTypes.prototype.formatInput = function () {
	        return this.frames[0].blanks;
	    };
	    OldTypes.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    OldTypes.prototype.formatAns = function () {
	        return this.frames[0].answer;
	    };
	    OldTypes.prototype.formatQue = function () {
	        return this.frames[0].question;
	    };
	    OldTypes.prototype.normalizeMultiSubmission = function (sub) {
	        var _sub = helper_1.JSONsafeParse(JSON.stringify(sub)).json;
	        var types = [
	            { begin: /^\\&quot;/, end: /\\&quot;$/, sep: /\\&quot;,\\&quot;/g },
	            { begin: /^\\"/, end: /\\"$/, sep: /\\",\\"/g },
	            { begin: /^"/, end: /"$/, sep: /","/g }
	        ];
	        var delim = '^^^^^';
	        types.forEach(function (type) {
	            _sub = _sub.replace(type.sep, delim).replace(type.begin, '').replace(type.end, '');
	        });
	        // At this point, we should have a string in which submissions for parts are delimited with a common sequence of characters.
	        var _normalized = _sub.split(delim);
	        // If this leaves us with a single-element array, we need to split using a comma delimiter.
	        if (_normalized.length === 1) {
	            _normalized = _normalized[0].split(',');
	        }
	        // At this stage, there's probably nothing left for parseMultiSubmission to do.
	        return _normalized;
	    };
	    OldTypes.prototype.getChoices = function () {
	        return this.answer_val_map;
	    };
	    OldTypes.prototype.cleanMML = function (data) {
	        var that = this;
	        var pattern = /<maction (.+?)>(.+?)<\/maction>/ig;
	        var toReplace = '<semantics><annotation-xml encoding="application/xhtml+xml"><input xmlns="http://www.w3.org/1999/xhtml" type="text" size="5" name="b" onKeyDown="inputKeydown(event)"  /></annotation-xml></semantics>';
	        var partNdx = this.getPartNdx(data.presentation_data.interactive_frames);
	        var tempDiv = this.$("<div></div>");
	        this.partNdx = partNdx;
	        var answer = this.data.a;
	        var _sub = this.normalizeMultiSubmission(that.orig_submission);
	        // Accessing [partNdx] was, I think, based on the assumption that orig_submission would at this point contain the submissions for all parts of the problem.
	        // However, I don't think that's the case, since multipart.ts sets it to the submission for the specific part.
	        // If this pans out, we can probably dispense with the _sub and set submission directly to the normalizeMultiSubmission value.
	        //		var submission = _sub[partNdx];
	        var submission = _sub;
	        var q = data.presentation_data.interactive_frames[0].text;
	        data.question = q;
	        if (data.presentation_data.interactive_frames[0].style == "no input") {
	            data["msg"] = "<b>Please submit your answer on paper.</b>";
	            data["inputBox"] = "";
	            data["submission"] = that.orig_submission;
	            data["answer"] = that.data.a;
	        }
	        else if (data.presentation_data.interactive_frames[0].style == "MultKinetic") {
	            // The code for MultKinetic is working with the front end. Please leave it as is for now.
	            var ans = (this.data.a).split(',');
	            var sub = (this.orig_submission).split(',');
	            var math = data.presentation_data.interactive_frames[0]["a"];
	            if (math === null || math === undefined) {
	                math = "";
	            }
	            data["inputBox"] = math.replace(pattern, toReplace);
	            tempDiv.html(data["inputBox"]);
	            var _subDiv = that.$("<div></div>").html(data["inputBox"]);
	            var _ansDiv = that.$("<div></div>").html(data["inputBox"]);
	            _ansDiv.find('input').each(function (i, ele) {
	                that.$(ele).attr("disabled", "").attr("value", ans[i]);
	            });
	            _subDiv.find('input').each(function (i, ele) {
	                that.$(ele).attr("disabled", "").attr("value", sub[i]);
	            });
	            var partQue = this.buildAnsTemplate();
	            var partAns = this.buildAnsTemplate();
	            var partSub = this.buildSubTemplate();
	            var classes = 'frameSubmission MultKinetic';
	            partSub = partSub.replace('__CLASSES__', classes);
	            partSub = partSub.replace('__Q__', q);
	            partSub = partSub.replace('__SUB__', _subDiv[0].outerHTML);
	            classes = 'frameAnswer MultKinetic';
	            partAns = partAns.replace('__CLASSES__', classes);
	            partAns = partAns.replace('__Q__', q);
	            partAns = partAns.replace('__A__', _ansDiv[0].outerHTML);
	            partQue = partQue.replace('__CLASSES__', classes);
	            partQue = partQue.replace('__Q__', q);
	            partQue = partQue.replace('__A__', '&nbsp;');
	            data.answer = partAns;
	            data.submission = partSub;
	            data.question = partQue;
	        }
	        else if (data.presentation_data.interactive_frames[0].style == "radio" || data.presentation_data.interactive_frames[0].style == "check") {
	            // The code for radio / check  is working with the front end. Please leave it as is for now.
	            ans = this.formatCheckboxes(answer, that.answer_val_map, partNdx, 'answer');
	            sub = this.formatCheckboxes(submission, that.answer_val_map, partNdx, 'sub');
	            var qcb = this.formatCheckboxes(answer, that.answer_val_map, partNdx, 'question');
	            var partQue = this.buildAnsTemplate();
	            var partAns = this.buildAnsTemplate();
	            var partSub = this.buildSubTemplate();
	            var classes = 'frameSubmission check';
	            partSub = partSub.replace('__CLASSES__', classes);
	            partSub = partSub.replace('__Q__', q);
	            partSub = partSub.replace('__SUB__', sub);
	            classes = 'frameAnswer check';
	            partAns = partAns.replace('__CLASSES__', classes);
	            partAns = partAns.replace('__Q__', q);
	            partAns = partAns.replace('__A__', ans);
	            partQue = partQue.replace('__CLASSES__', classes);
	            partQue = partQue.replace('__Q__', q);
	            partQue = partQue.replace('__A__', qcb);
	            data.submission = partSub;
	            data.answer = partAns;
	            data.question = partQue;
	        }
	        else if (data.presentation_data.interactive_frames[0].style == 'essay') {
	            // that.$('._tempDiv').html(data.presentation_data.interactive_frames[0].a);
	            // if (data.presentation_data.interactive_frames[0].a == null) {
	            //     data.presentation_data.interactive_frames[0].a = "";
	            // }
	            data.inputBox = '<div contenteditable="true" class="essay"></div>';
	            data.submission = '<div contenteditable="true" class="essay">' + helper_1.cleanEntities(that.orig_submission) + '</div>';
	            data.answer = '<div contenteditable="true" class="essay">' + helper_1.cleanEntities(that.data.a) + '</div>';
	        }
	        else {
	            // that.$('._tempDiv').html(data.presentation_data.interactive_frames[0].a);
	            // if (data.presentation_data.interactive_frames[0].a == null) {
	            //     data.presentation_data.interactive_frames[0].a = "";
	            // }
	            data.inputBox = '<div class="essay equation-input"></div>';
	            data.submission = '<div class="essay equation-input">' + helper_1.cleanEntities(that.orig_submission) + '</div>';
	            data.answer = '<div class="essay equation-input">' + helper_1.cleanEntities(that.data.a) + '</div>';
	        }
	        return data;
	    };
	    OldTypes.prototype.createFrame = function () {
	        var result;
	        result = { blanks: '', answer: '', submission: '', question: '' };
	        var that = this;
	        var MathJax = this.MathJax;
	        var problemData = this.data;
	        var config = this.config;
	        var inputBox = this.cleanedData.inputBox;
	        result.blanks = inputBox;
	        result.answer = this.cleanedData.answer;
	        result.submission = this.cleanedData.submission;
	        result.question = this.cleanedData.question;
	        return result;
	    };
	    return OldTypes;
	}(eoc_1.default));
	exports.default = OldTypes;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Extended Types library.
	 * Grid2
	 * Author: Mitr
	 *
	 * Public functions:
	 *   getBlocks
	 *   appendElements
	 *
	 */
	'use strict';
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var eoc_1 = __webpack_require__(3);
	var commonGrid_1 = __webpack_require__(15);
	var helper_1 = __webpack_require__(4);
	var grid2 = /** @class */ (function (_super) {
	    __extends(grid2, _super);
	    function grid2(data, config) {
	        var _this = _super.call(this, data, config) || this;
	        var frames = [];
	        if (_this.interactive_frames) {
	            _this.$ = config.inject && config.inject.$ || {};
	            _this.MathJax = config.inject && config.inject.MathJax || {};
	            _this.createjs = config.createjs && config.inject.createjs || {};
	            _this.config = config;
	            _this.interactive_frames.forEach(function (item) {
	                frames.push(_this.createInteractiveFrames(item));
	            });
	        }
	        _this.frames = frames;
	        return _this;
	    }
	    //---------- PUBLIC ----------
	    // getBlocks: return hash of elements to plug in to page.
	    // Use this function to return individual blocks of HTML for inclusion where needed.
	    grid2.prototype.getBlocks = function () {
	        var blocks = this.frames.length > 0 ? [
	            { name: 'grid2', code: "" },
	            { name: 'question', code: this.data.presentation_data.interactive_frames[0].text },
	            { name: 'submission', code: this.formatSub() },
	            { name: 'blank', code: this.formatBlank() },
	            { name: 'answer', code: this.formatAnswer() }
	        ] : [];
	        return blocks;
	    };
	    // appendElements: attach generated elements to the specified DOM container.
	    // Use this function to directly append each of the blocks to the specified DOM element, including MathJax processing.
	    grid2.prototype.appendElements = function () {
	        var _this = this;
	        var problemBlocks = this.getBlocks();
	        this.$.each(problemBlocks, function (key, blockObj) {
	            var block = blockObj.code.blanks;
	            if (block.indexOf('</math>') != -1) {
	                _this.MathJax.Hub.Queue(["Typeset", _this.MathJax.Hub, block]);
	            }
	            $(block).appendTo(_this.config.dom.ansContainer);
	        });
	    };
	    //---------- PRIVATE ----------
	    grid2.prototype.formatBlank = function () {
	        return this.frames[0].blank;
	    };
	    grid2.prototype.formatAnswer = function () {
	        return this.frames[0].answer;
	    };
	    grid2.prototype.formatSub = function () {
	        return this.frames[0].submission;
	    };
	    grid2.prototype.createInteractiveFrames = function (frameData) {
	        var _this = this;
	        var result;
	        result = { blank: '', answer: '', submission: '' };
	        var dt, minX, maxX, minY, maxY, stepX, stepY, skip;
	        if (frameData.hasOwnProperty("qGraph")) {
	            dt = frameData.qGraph;
	            // minX = +(dt.axis.x.min)
	            // maxX = +(dt.axis.x.max)
	            // minY = +(dt.axis.y.min)
	            // maxY = +(dt.axis.y.max)
	            // stepX = +(dt.axis.x.step)
	            // stepY = +(dt.axis.y.step)
	            // skip = +(dt.axis.skip)
	        }
	        else {
	            dt = {
	                axis: {
	                    skip: 1,
	                    x: { max: 10, min: -10, step: 1 },
	                    y: { max: 10, step: 1, min: -10 }
	                },
	                eqs: ["line=-0.2,12"],
	                pointsRequired: 0
	            };
	            // dt = { "x": "-10,10,1", "y": "-10,10,1", "skip": 1 };
	            // minX = +(dt.x.split(",")[0])
	            // maxX = +(dt.x.split(",")[1])
	            // minY = +(dt.y.split(",")[0])
	            // maxY = +(dt.y.split(",")[1])
	            // stepX = +(dt.x.split(",")[2])
	            // stepY = +(dt.y.split(",")[2])
	            // skip = +(dt.skip)
	        }
	        var el = this.$("<div style='width:500px;height:500px'></div>");
	        var g = new commonGrid_1.default();
	        g.init(dt, el, this.config);
	        // result.blank = el[0].outerHTML;
	        result.blank = "<img src='" + g.getCanvasImage() + "'/>";
	        var points = this.data.presentation_data.interactive_frames[0].pointPlotting ? this.data.presentation_data.interactive_frames[0].pointPlotting : false;
	        var lines = this.data.presentation_data.interactive_frames[0].linePlotting ? this.data.presentation_data.interactive_frames[0].linePlotting : false;
	        var equiv = false;
	        if (this.data.presentation_data.interactive_frames[0].hasOwnProperty("use_equiv_grading")) {
	            equiv = this.data.presentation_data.interactive_frames[0].use_equiv_grading;
	        }
	        this.orig_submission = this.orig_submission.replace(/&#8722;/g, '-');
	        this.orig_submission = this.orig_submission.replace(/\\\\"/g, '"');
	        this.orig_submission = this.orig_submission.replace(/\\"/g, '"');
	        // 		this.orig_submission = JSONsafeParse("[" + this.orig_submission + "]");
	        this.data.a = this.data.a.replace(/&#8722;/g, '-');
	        this.data.a = this.data.a.replace(/\\\\"/g, '"');
	        this.data.a = this.data.a.replace(/\\"/g, '"');
	        // 		this.data.a = JSONsafeParse("[" + this.data.a + "]");
	        // 		console.log(this.orig_submission, this.data.a)
	        if (this.orig_submission) {
	            var origSubPoints = void 0;
	            var origSubLines = void 0;
	            if (points && lines) {
	                origSubPoints = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.orig_submission[0]);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return [];
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.orig_submission[0] + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return [];
	                        }
	                    })();
	                origSubLines = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.orig_submission[1]);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return [];
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.orig_submission[1] + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return [];
	                        }
	                    })();
	            }
	            else if (points) {
	                origSubPoints = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.orig_submission);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return [];
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.orig_submission + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return [];
	                        }
	                    })();
	            }
	            else if (lines) {
	                origSubLines = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.orig_submission);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return [];
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.orig_submission + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return [];
	                        }
	                    })();
	            }
	            var el1 = this.$("<div style='width:500px;height:500px'></div>");
	            var g1 = new commonGrid_1.default();
	            g1.init(dt, el1, this.config);
	            g1.drawLinePoint({ answerDataPoint: origSubPoints, answerDataLine: origSubLines });
	            //result.submission = el1[0].outerHTML;
	            result.submission = "<img src='" + g1.getCanvasImage() + "'/>";
	        }
	        else {
	            var el1 = this.$("<div style='width:500px;height:500px'></div>");
	            var g1 = new commonGrid_1.default();
	            g1.init(dt, el1, this.config);
	            // result.submission = el1[0].outerHTML;
	            result.submission = "<img src='" + g1.getCanvasImage() + "'/>";
	        }
	        if (this.data.a && this.data.a != "") {
	            var origSubPoints = void 0;
	            var origSubLines = void 0;
	            if (points && lines) {
	                origSubPoints = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.data.a[0]);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return result.str;
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.data.a[0] + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return result.str;
	                        }
	                    })();
	                origSubLines = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.data.a[1]);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return result.str;
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.data.a[1] + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return result.str;
	                        }
	                    })();
	            }
	            else if (points) {
	                origSubPoints = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.data.a);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return result.str;
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.data.a + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return result.str;
	                        }
	                    })();
	            }
	            else if (lines) {
	                origSubLines = equiv ? (function () {
	                    var result = helper_1.JSONsafeParse(_this.data.a);
	                    if (result.valid) {
	                        return result.json;
	                    }
	                    else {
	                        return result.str;
	                    }
	                })() :
	                    (function () {
	                        var result = helper_1.JSONsafeParse("[" + _this.data.a + "]");
	                        if (result.valid) {
	                            return result.json;
	                        }
	                        else {
	                            return result.str;
	                        }
	                    })();
	            }
	            var el2 = this.$("<div style='width:500px;height:500px'></div>");
	            var g2 = new commonGrid_1.default();
	            g2.init(dt, el2, this.config);
	            console.log(helper_1.cleanEntities(origSubPoints), helper_1.cleanEntities(origSubLines));
	            g2.drawLinePoint({ answerDataPoint: origSubPoints, answerDataLine: origSubLines });
	            //result.answer = el2[0].outerHTML;
	            result.answer = "<img src='" + g2.getCanvasImage() + "'/>";
	        }
	        else if (frameData.hasOwnProperty("qGraph") && frameData.qGraph.hasOwnProperty("eqs") && frameData.qGraph.eqs.length != 0) {
	            var el2 = this.$("<div style='width:500px;height:500px'></div>");
	            var g2 = new commonGrid_1.default();
	            g2.init(dt, el2, this.config);
	            var eqArr = (frameData.qGraph.eqs[0].split('=').pop()).split(',');
	            var slope = +(eqArr[0]);
	            var interset = +(eqArr[1]);
	            g2.drawEqLine(slope, interset);
	            result.answer = "<img src='" + g2.getCanvasImage() + "'/>";
	        }
	        else {
	            var el2 = this.$("<div style='width:500px;height:500px'></div>");
	            var g2 = new commonGrid_1.default();
	            g2.init(dt, el2, this.config);
	            // result.answer = el2[0].outerHTML;
	            result.answer = "<img src='" + g2.getCanvasImage() + "'/>";
	        }
	        return result;
	    };
	    return grid2;
	}(eoc_1.default));
	exports.default = grid2;


/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var graph = function () {
	    var scope = this;
	    this.obj = {};
	    this.plotArr = [];
	    var canvas, stage;
	    var canvasWidth, canvasHeight;
	    var dragDot, _text;
	    this.createjs = {};
	    this.$ = {};
	    var xLine = {};
	    var yLine = {};
	    var divisions1, divisions2, unitInt1, unitInt2, originX, originY, ctx, xLinesArr, yLinesArr, xNosArr, yNosArr, axesObj, device, quadrant;
	    var xAxisLinesArr, yAxisLinesArr;
	    this.init = function (obj, el, config) {
	        scope.$ = config.inject && config.inject.$ || {};
	        scope.createjs = config.inject && config.inject.createjs || {};
	        scope.obj = obj;
	        canvas = this.$("<canvas style='width:500px;height:500px'></canvas>");
	        el.append(canvas);
	        // scope.xArr = (obj.x).split(',');
	        // scope.yArr = (obj.y).split(',');
	        scope.xArr = [obj.axis.x.min, obj.axis.x.max, obj.axis.x.step];
	        scope.yArr = [obj.axis.y.min, obj.axis.y.max, obj.axis.y.step];
	        canvasWidth = parseInt(scope.$(canvas).css('width'));
	        canvasHeight = parseInt(scope.$(canvas).css('height'));
	        canvas.attr('width', canvasWidth);
	        canvas.attr('height', canvasHeight);
	        stage = new scope.createjs.Stage(canvas[0]);
	        stage.width = canvasWidth;
	        stage.height = canvasHeight;
	        stage.x = 30;
	        stage.y = 30;
	        window["stage"] = stage;
	        // scope.createjs.Touch.enable(stage);
	        ctx = canvas[0].getContext("2d");
	        scope.calculateDivisionsData();
	        scope.populateAxisLinesArr();
	    };
	    this.getCanvas = function () {
	        return stage;
	    };
	    this.getCanvasImage = function () {
	        return canvas[0].toDataURL();
	    };
	    this.pointToPixelLine = function (o, temp) {
	        var x1, y1, x2, y2;
	        temp = [];
	        if (o.x1 !== "") {
	            x1 = (Number(o.x1) * unitInt1) + originX;
	        }
	        if (o.y1 !== "") {
	            y1 = originY - (Number(o.y1) * unitInt2);
	        }
	        if (o.x2 !== "") {
	            x2 = (Number(o.x2) * unitInt1) + originX;
	        }
	        if (o.y2 !== "") {
	            y2 = originY - (Number(o.y2) * unitInt2);
	        }
	        temp.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
	        return temp;
	    };
	    this.pointToPixel = function (o, temp) {
	        var x, y;
	        temp = [];
	        if (o.x !== "") {
	            x = (Number(o.x) * unitInt1) + originX;
	        }
	        if (o.y !== "") {
	            y = originY - (Number(o.y) * unitInt2);
	        }
	        temp.push({ x: x, y: y });
	        return temp;
	    };
	    this.calculateDivisionsData = function () {
	        divisions1 = Math.abs(scope.xArr[0]) + Math.abs(scope.xArr[1]);
	        divisions2 = Math.abs(scope.yArr[0]) + Math.abs(scope.yArr[1]);
	        unitInt1 = ((parseInt(canvasWidth) - 60) / divisions1);
	        unitInt2 = ((parseInt(canvasHeight) - 60) / divisions2);
	        originX = (Math.abs(scope.xArr[0]) * unitInt1); // + canvas.left();
	        originY = (Math.abs(scope.yArr[1]) * unitInt2); // + canvas.top();
	        var tempObj = {
	            // -- verticle-upwards
	            'line1': {
	                'x1': originX,
	                'y1': originY,
	                'x2': originX,
	                'y2': 0,
	                'triangleX2': originX - 4,
	                'triangleY2': 0 + 11,
	                'triangleX3': originX + 4,
	                'triangleY3': 0 + 11,
	                'triangleBool': true,
	                'nameStr': 'y',
	                'nameX': (originX - 14),
	                'nameY': (0 + 9)
	            },
	            // -- verticle-downward
	            'line2': {
	                'x1': originX,
	                'y1': originY,
	                'x2': originX,
	                'y2': (0 + parseInt(canvasHeight) - 60),
	                'triangleX2': originX - 4,
	                'triangleY2': (0 + parseInt(canvasHeight) - 60) - 13,
	                'triangleX3': originX + 4,
	                'triangleY3': (0 + parseInt(canvasHeight) - 60) - 13,
	                'triangleBool': true
	            },
	            // -- horizontal left
	            'line3': {
	                'x1': originX,
	                'y1': originY,
	                'x2': 0,
	                'y2': originY,
	                'triangleX2': 0 + 11,
	                'triangleY2': originY - 4,
	                'triangleX3': 0 + 11,
	                'triangleY3': originY + 4,
	                'triangleBool': true
	            },
	            // -- horizontal right
	            'line4': {
	                'x1': originX,
	                'y1': originY,
	                'x2': (0 + parseInt(canvasWidth) - 60),
	                'y2': originY,
	                'triangleX2': (0 + parseInt(canvasWidth) - 60) - 13,
	                'triangleY2': originY - 4,
	                'triangleX3': (0 + parseInt(canvasWidth) - 60) - 13,
	                'triangleY3': originY + 4,
	                'triangleBool': true,
	                'nameStr': 'x',
	                'nameX': ((0 + parseInt(canvasWidth) - 60) - 9),
	                'nameY': (originY + 14)
	            }
	        };
	        if (scope.xArr[0] === 0) {
	            tempObj.line3.triangleBool = false;
	        }
	        if (scope.xArr[1] === 0) {
	            tempObj.line4.triangleBool = false;
	            tempObj.line4.nameX = 0 + 6;
	        }
	        if (scope.yArr[0] === 0) {
	            tempObj.line2.triangleBool = false;
	        }
	        if (scope.yArr[1] === 0) {
	            tempObj.line1.triangleBool = false;
	            tempObj.line1.nameY = 0 + parseInt(canvasHeight);
	        }
	        axesObj = tempObj;
	        scope.populateNumberArrays();
	        scope.populateLinesArr();
	        scope.populateAxisLinesArr();
	        scope.draw();
	        //scope.addEvents();
	    };
	    this.populateLinesArr = function () {
	        var xArr = [];
	        var yArr = [];
	        var count = 0;
	        for (var x1 = (originX); x1 < (0 + canvasWidth); x1 += unitInt1) {
	            if (count % (parseInt(scope.xArr[2])) === 0) {
	                var tempObj1 = {
	                    'x1': x1,
	                    'y1': 0,
	                    'x2': x1,
	                    'y2': (0 + canvasHeight - 60)
	                };
	                xArr.push(tempObj1);
	            }
	            count++;
	        }
	        count = 0;
	        for (var x2 = (originX); x2 > (0); x2 -= unitInt1) {
	            if (count % (parseInt(scope.xArr[2])) === 0) {
	                var tempObj2 = {
	                    'x1': x2,
	                    'y1': 0,
	                    'x2': x2,
	                    'y2': (0 + canvasHeight - 60)
	                };
	                xArr.push(tempObj2);
	            }
	            count++;
	        }
	        count = 0;
	        for (var y1 = (originY); y1 < (0 + canvasHeight); y1 += unitInt2) {
	            if (count % (parseInt(scope.yArr[2])) === 0) {
	                var tempObj3 = {
	                    'x1': 0,
	                    'y1': y1,
	                    'x2': (0 + canvasWidth - 60),
	                    'y2': y1
	                };
	                yArr.push(tempObj3);
	            }
	            count++;
	        }
	        count = 0;
	        for (var y2 = (originY); y2 > (0); y2 -= unitInt2) {
	            if (count % (parseInt(scope.yArr[2])) === 0) {
	                var tempObj4 = {
	                    'x1': 0,
	                    'y1': y2,
	                    'x2': (0 + canvasWidth - 60),
	                    'y2': y2
	                };
	                yArr.push(tempObj4);
	            }
	            count++;
	        }
	        xLinesArr = xArr;
	        yLinesArr = yArr;
	    };
	    this.populateAxisLinesArr = function () {
	        var xAxisArr = [];
	        var yAxisArr = [];
	        var count = 0;
	        for (var x1 = (originX); x1 < (5 + canvasWidth - 60); x1 += unitInt1) {
	            if (count % (parseInt(scope.xArr[2])) === 0) {
	                var tempObj1 = {
	                    'x1': x1,
	                    'y1': originY + 6,
	                    'x2': x1,
	                    'y2': (originY - 6)
	                };
	                xAxisArr.push(tempObj1);
	            }
	            count++;
	        }
	        count = 0;
	        for (var x2 = (originX); x2 > (5); x2 -= unitInt1) {
	            if (count % (parseInt(scope.xArr[2])) === 0) {
	                var tempObj2 = {
	                    'x1': x2,
	                    'y1': originY + 6,
	                    'x2': x2,
	                    'y2': (originY - 6)
	                };
	                xAxisArr.push(tempObj2);
	            }
	            count++;
	        }
	        count = 0;
	        for (var y1 = (originY); y1 < (5 + canvasHeight - 60); y1 += unitInt2) {
	            if (count % (parseInt(scope.yArr[2])) === 0) {
	                var tempObj3 = {
	                    'x1': originX - 6,
	                    'y1': y1,
	                    'x2': (originX + 6),
	                    'y2': y1
	                };
	                yAxisArr.push(tempObj3);
	            }
	            count++;
	        }
	        count = 0;
	        for (var y2 = (originY); y2 > (5); y2 -= unitInt2) {
	            if (count % (parseInt(scope.yArr[2])) === 0) {
	                var tempObj4 = {
	                    'x1': originX - 6,
	                    'y1': y2,
	                    'x2': (originX + 6),
	                    'y2': y2
	                };
	                yAxisArr.push(tempObj4);
	            }
	            count++;
	        }
	        xAxisLinesArr = xAxisArr;
	        yAxisLinesArr = yAxisArr;
	    };
	    this.populateNumberArrays = function () {
	        var xOff = 0;
	        var yOff = 0;
	        var xAxis = [];
	        var yAxis = [];
	        xOff = originX - 5;
	        yOff = originY - 5;
	        var a = 0;
	        var b = 0;
	        var c = 0;
	        var d = 0;
	        var tempStr = '';
	        var tempX = 0;
	        for (var i = a; i > scope.xArr[0]; i -= (parseInt(scope.xArr[2]) * (parseInt(scope.obj.axis.skip) + 1))) {
	            if (i != 0) {
	                tempStr = '–' + Math.abs(i);
	                tempX = ((originX) - (Math.abs(i) * unitInt1));
	                var tempObj = {
	                    'text': tempStr,
	                    'x': tempX,
	                    'y': yOff
	                };
	                xAxis.push(tempObj);
	            }
	        }
	        for (var j = b; j < scope.xArr[1]; j += (parseInt(scope.xArr[2]) * (parseInt(scope.obj.axis.skip) + 1))) {
	            if (j != 0) {
	                tempStr = Math.abs(j);
	                var tempObj2 = {
	                    'text': tempStr,
	                    'x': (originX) + (Math.abs(j) * unitInt1),
	                    'y': yOff
	                };
	                xAxis.push(tempObj2);
	            }
	        }
	        for (var k = c; k > scope.yArr[0]; k -= (parseInt(scope.yArr[2]) * (parseInt(scope.obj.axis.skip) + 1))) {
	            if (k != 0) {
	                tempStr = '–' + Math.abs(k);
	                var tempObj3 = {
	                    'text': tempStr,
	                    'x': xOff,
	                    'y': (originY) + (Math.abs(k) * unitInt2)
	                };
	                yAxis.push(tempObj3);
	            }
	        }
	        for (var l = d; l < scope.yArr[1]; l += (parseInt(scope.yArr[2]) * (parseInt(scope.obj.axis.skip) + 1))) {
	            if (l != 0) {
	                tempStr = Math.abs(l);
	                var tempObj4 = {
	                    'text': tempStr,
	                    'x': xOff,
	                    'y': (originY) - (Math.abs(l) * unitInt2)
	                };
	                yAxis.push(tempObj4);
	            }
	        }
	        xNosArr = xAxis;
	        yNosArr = yAxis;
	    };
	    this.draw = function () {
	        var shape = new scope.createjs.Shape();
	        shape.graphics.beginFill("#e8e8e8").drawRect(0, 0, canvasWidth - 60, canvasHeight - 60);
	        stage.addChild(shape);
	        // -- Draw lines perpendicular to x-axis
	        for (var x = 0; x < xLinesArr.length; x++) {
	            var l = new scope.createjs.Shape();
	            l.graphics.setStrokeStyle(2).beginStroke('#cecece').moveTo(xLinesArr[x].x1, xLinesArr[x].y1).lineTo(xLinesArr[x].x2, xLinesArr[x].y2).endStroke();
	            stage.addChild(l);
	        }
	        // -- Draw lines perpendicular to y-axis
	        for (var y = 0; y < yLinesArr.length; y++) {
	            var l = new scope.createjs.Shape();
	            l.graphics.setStrokeStyle(2).beginStroke('#cecece').moveTo(yLinesArr[y].x1, yLinesArr[y].y1).lineTo(yLinesArr[y].x2, yLinesArr[y].y2).endStroke();
	            stage.addChild(l);
	        }
	        // ------------------------------------------ //
	        for (var x = 0; x < xAxisLinesArr.length; x++) {
	            var l = new scope.createjs.Shape();
	            l.graphics.setStrokeStyle(1).beginStroke('rgb(0, 0, 0)').moveTo(xAxisLinesArr[x].x1, xAxisLinesArr[x].y1).lineTo(xAxisLinesArr[x].x2, xAxisLinesArr[x].y2).endStroke();
	            stage.addChild(l);
	        }
	        // -- Draw lines perpendicular to y-axis
	        for (var y = 0; y < yAxisLinesArr.length; y++) {
	            var l = new scope.createjs.Shape();
	            l.graphics.setStrokeStyle(1).beginStroke('rgb(0, 0, 0)').moveTo(yAxisLinesArr[y].x1, yAxisLinesArr[y].y1).lineTo(yAxisLinesArr[y].x2, yAxisLinesArr[y].y2).endStroke();
	            stage.addChild(l);
	        }
	        // ------------------------------------------ //
	        // -- Draw 2 axes
	        // if (axesVisible) {
	        Object.keys(axesObj).forEach(function (key) {
	            var l = new scope.createjs.Shape();
	            l.graphics.setStrokeStyle(1).beginStroke('rgb(0, 0, 0)').moveTo(axesObj[key].x1, axesObj[key].y1).lineTo(axesObj[key].x2, axesObj[key].y2).endStroke();
	            stage.addChild(l);
	            if (axesObj[key].hasOwnProperty('nameStr')) {
	                var txt = new scope.createjs.Text(axesObj[key].nameStr, "14px Arial", "rgb(112, 112, 112)");
	                txt.x = axesObj[key].nameX;
	                txt.y = axesObj[key].nameY;
	                txt.textBaseline = 'alphabetic';
	                stage.addChild(txt);
	            }
	        });
	        // -- Draw 4 triangles
	        // if (triangleVisible) {
	        Object.keys(axesObj).forEach(function (key) {
	            if (axesObj[key].triangleBool) {
	                var l = new scope.createjs.Shape();
	                l.graphics.setStrokeStyle(2).beginStroke('rgb(0, 0, 0)').moveTo(axesObj[key].x2, axesObj[key].y2).lineTo(axesObj[key].triangleX2, axesObj[key].triangleY2);
	                l.graphics.lineTo(axesObj[key].triangleX3, axesObj[key].triangleY3).lineTo(axesObj[key].x2, axesObj[key].y2).endStroke();
	                stage.addChild(l);
	            }
	        });
	        // }
	        // if (numbersVisible) {
	        // -- Numbers On x-axis
	        xNosArr.forEach(function (i) {
	            var txt = new scope.createjs.Text(i.text, "bold 14px Arial", "rgb(0, 0, 0)");
	            txt.x = i.x;
	            txt.y = i.y + 25;
	            txt.textBaseline = 'alphabetic';
	            txt.textAlign = 'center';
	            stage.addChild(txt);
	        });
	        // -- Numbers On y-axis
	        yNosArr.forEach(function (i) {
	            var txt = new scope.createjs.Text(i.text, "bold 14px Arial", "rgb(0, 0, 0)");
	            txt.x = i.x - 5;
	            txt.y = i.y;
	            txt.textBaseline = 'middle';
	            txt.textAlign = 'right';
	            stage.addChild(txt);
	        });
	        var l1 = new scope.createjs.Shape();
	        stage.addChild(l1);
	        xLine = l1;
	        var l2 = new scope.createjs.Shape();
	        stage.addChild(l2);
	        yLine = l2;
	        window["yLine"] = l2;
	        stage.update();
	    };
	    this.anglePointVal = function (obj) {
	        var tempArr = [];
	        var angleP = ((Math.atan2((obj.y2 - obj.y1), (obj.x2 - obj.x1))) * 180) / Math.PI;
	        var newAngle1 = ((angleP - 30) * Math.PI) / 180;
	        var newAngle2 = ((angleP + 30) * Math.PI) / 180;
	        tempArr.push({
	            x1: obj.x1,
	            y1: obj.y1,
	            x2: obj.x1 + (15 * Math.cos(newAngle1)),
	            y2: obj.y1 + (15 * Math.sin(newAngle1))
	        }, {
	            x1: obj.x1,
	            y1: obj.y1,
	            x2: obj.x1 + (15 * Math.cos(newAngle2)),
	            y2: obj.y1 + (15 * Math.sin(newAngle2))
	        }, {
	            x1: obj.x2 + (15 * Math.cos(Math.PI + newAngle1)),
	            y1: obj.y2 + (15 * Math.sin(Math.PI + newAngle1)),
	            x2: obj.x2,
	            y2: obj.y2
	        }, {
	            x1: obj.x2 + (15 * Math.cos(Math.PI + newAngle2)),
	            y1: obj.y2 + (15 * Math.sin(Math.PI + newAngle2)),
	            x2: obj.x2,
	            y2: obj.y2
	        });
	        return tempArr;
	    };
	    this.drawLinePoint = function (obj) {
	        var _answerDataPoint = obj.answerDataPoint;
	        var _answerDataLine = obj.answerDataLine;
	        var tempArr = [];
	        // var arrowArr = [];
	        if (_answerDataPoint) {
	            for (var i = 0; i < _answerDataPoint.length; i++) {
	                var str = (_answerDataPoint[i]).replace(/\(|\)/g, '');
	                var p = scope.pointToPixel({ x: str.split(',')[0], y: str.split(',')[1] });
	                var c = new scope.createjs.Shape();
	                if (p[0].x != undefined && p[0].y != undefined) {
	                    c.set({ x: p[0].x, y: p[0].y }).graphics.beginFill('red').drawCircle(0, 0, 4);
	                    stage.addChild(c);
	                }
	            }
	        }
	        if (_answerDataLine) {
	            for (var i = 0; i < _answerDataLine.length; i += 2) {
	                var str1 = (_answerDataLine[i]).replace(/\(|\)/g, '');
	                var str2 = (_answerDataLine[i + 1]) ? (_answerDataLine[i + 1]).replace(/\(|\)/g, '') : (_answerDataLine[i]).replace(/\(|\)/g, '');
	                var p1 = scope.pointToPixel({ x: str1.split(',')[0], y: str1.split(',')[1] });
	                var p2 = scope.pointToPixel({ x: str2.split(',')[0], y: str2.split(',')[1] });
	                var l = new scope.createjs.Shape();
	                // var p1 = new scope.createjs.Shape();
	                // var p2 = new scope.createjs.Shape();
	                // arrowArr = scope.anglePointVal(tempArr[0]);
	                // arrowArr.forEach((data, i) => {
	                //     var y = new scope.createjs.Shape();
	                //     y.graphics.setStrokeStyle(2).beginStroke('black').moveTo(data.x1, data.y1).lineTo(data.x2, data.y2).endStroke();
	                //     stage.addChild(y);
	                // });
	                var c1 = new scope.createjs.Shape();
	                var c2 = new scope.createjs.Shape();
	                if (p1[0].x != undefined && p1[0].y != undefined && p2[0].x != undefined && p2[0].y != undefined) {
	                    c1.set({ x: p1[0].x, y: p1[0].y }).graphics.beginFill('red').drawCircle(0, 0, 4);
	                    stage.addChild(c1);
	                    c2.set({ x: p2[0].x, y: p2[0].y }).graphics.beginFill('red').drawCircle(0, 0, 4);
	                    stage.addChild(c2);
	                    l.graphics.setStrokeStyle(3).beginStroke('#287472').moveTo(p1[0].x, p1[0].y).lineTo(p2[0].x, p2[0].y).endStroke();
	                    stage.addChild(l);
	                }
	            }
	        }
	        stage.update();
	    };
	    this.drawEqLine = function (m, b) {
	        var _obj = { "x1": null, "x2": null, "y1": null, "y2": null };
	        var x1 = scope.xArr[0]; // lowerbound
	        var x2 = scope.xArr[1]; // upperbound
	        var y1 = (x1 * m + b);
	        var y2 = (x2 * m + b);
	        _obj.x1 = x1;
	        _obj.x2 = x2;
	        _obj.y1 = y1;
	        _obj.y2 = y2;
	        var p1 = scope.pointToPixel({ x: _obj.x1, y: _obj.y1 });
	        var p2 = scope.pointToPixel({ x: _obj.x2, y: _obj.y2 });
	        var l = new scope.createjs.Shape();
	        // var c1 = new scope.createjs.Shape();
	        // var c2 = new scope.createjs.Shape();
	        if (p1[0].x != undefined && p1[0].y != undefined && p2[0].x != undefined && p2[0].y != undefined) {
	            // c1.set({ x: p1[0].x, y: p1[0].y }).graphics.beginFill('red').drawCircle(0, 0, 4);
	            // stage.addChild(c1);
	            // c2.set({ x: p2[0].x, y: p2[0].y }).graphics.beginFill('red').drawCircle(0, 0, 4);
	            // stage.addChild(c2);
	            l.graphics.setStrokeStyle(3).beginStroke('#287472').moveTo(p1[0].x, p1[0].y).lineTo(p2[0].x, p2[0].y).endStroke();
	            stage.addChild(l);
	        }
	        stage.update();
	    };
	    this.drawLinePointInitial = function (obj) {
	        var _initialLine = obj.initialLine;
	        var _initialPoint = obj.initialPoint;
	        var tempArr = [];
	        // var arrowArr = [];
	        for (var x = 0; x < _initialLine.length; x++) {
	            tempArr = scope.pointToPixelLine(_initialLine[x], tempArr);
	            var l = new scope.createjs.Shape();
	            // var p1 = new scope.createjs.Shape();
	            // var p2 = new scope.createjs.Shape();
	            // arrowArr = scope.anglePointVal(tempArr[0]);
	            // arrowArr.forEach((data, i) => {
	            //     var y = new scope.createjs.Shape();
	            //     y.graphics.setStrokeStyle(2).beginStroke('black').moveTo(data.x1, data.y1).lineTo(data.x2, data.y2).endStroke();
	            //     stage.addChild(y);
	            // });
	            l.graphics.setStrokeStyle(3).beginStroke('#287472').moveTo(tempArr[0].x1, tempArr[0].y1).lineTo(tempArr[0].x2, tempArr[0].y2).endStroke();
	            stage.addChild(l);
	            // stage.addChild(p1);
	            // stage.addChild(p2);
	        }
	        for (var x = 0; x < _initialPoint.length; x++) {
	            tempArr = scope.pointToPixel(_initialPoint[x], tempArr);
	            var c = new scope.createjs.Shape();
	            if (tempArr[0].x != undefined && tempArr[0].y != undefined) {
	                c.set({ x: tempArr[0].x, y: tempArr[0].y }).graphics.beginFill('red').drawCircle(0, 0, 4);
	                stage.addChild(c);
	            }
	        }
	        stage.update();
	    };
	    function round(value, step) {
	        step || (step = 1.0);
	        var inv = 1.0 / step;
	        return Math.round(value * inv) / inv;
	    }
	};
	exports.default = graph;


/***/ }
/******/ ]);