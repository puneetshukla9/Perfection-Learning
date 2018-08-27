'use strict';

import freeInput from './free-input-directive.ts';
import graphConst from './graph-const-directive.ts';
import problemType from './problem-type-directive.ts';
import TEI from './tei/tei.ts';
import DragAndDrop from './tei/drag-and-drop.ts';
import Matching from './tei/matching.ts';
import MultiSelect from './tei/multiselect.ts';
import DefaultProblemType from './tei/default-problem-type.ts';
import MultiPart from './tei/multipart.ts';
import './tei/tei.less';

export default angular.module('core.problemtype', [])
	.factory('TEI', TEI)
	.factory('MultiPart', MultiPart)
	.factory('DragAndDrop', DragAndDrop)
	.factory('Matching', Matching)
	.factory('MultiSelect', MultiSelect)
	.factory('DefaultProblemType', DefaultProblemType)
	.directive('freeInput', freeInput)
	.directive('graphConst', graphConst)
	.directive('problemType', problemType);
