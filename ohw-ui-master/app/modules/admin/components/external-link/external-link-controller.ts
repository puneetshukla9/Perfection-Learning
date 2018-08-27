'use strict';

export default function($window, $stateParams) {
  var url = $stateParams.url;
  console.log('from external-link-controller.ts');
  $window.location.href = url;
};
