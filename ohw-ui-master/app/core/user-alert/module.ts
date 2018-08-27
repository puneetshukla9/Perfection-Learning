'use strict';

import userAlertService from './user-alert-service.ts';
import userAlert from './user-alert-directive.ts';
import userAlertCtrl from './user-alert-controller.ts';
import './user-alert.less';
export default angular.module('core.useralert', [])
  .controller('userAlertCtrl', userAlertCtrl)
  .directive('userAlert', userAlert)
  .service('userAlertService', userAlertService);
