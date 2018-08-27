'use strict';

import wizardService from './wizard-service.ts';
import wizardDirective from './wizard-directive.ts';
import wizardTabs from './wizard-tabs-directive.ts';

export default angular.module('core.wizard', [])
	.directive('wizard', wizardDirective)
	.service('Wizard', wizardService)
	.directive('wizardTabs', wizardTabs);
