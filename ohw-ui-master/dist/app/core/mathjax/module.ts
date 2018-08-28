'use strict';

import mathjax from './mathjax-directive.ts';
import mathjaxRepeat from './mathjax-repeat-directive.ts';

angular.module('core.mathjax', [])
	.directive('mathjaxRepeat', mathjaxRepeat)
	.directive('mathjax', mathjax);
