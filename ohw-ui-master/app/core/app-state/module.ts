'use strict';

import appState from './app-state-factory.ts';

export default angular.module('core.appstate', [])
  .factory('AppState', appState);
