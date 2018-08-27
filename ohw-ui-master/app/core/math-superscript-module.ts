'use strict';

export default angular.module('core.mathxsuperscript', [])
  .controller('mathxCtr', ['$scope', '$sce', function($scope, $sce) {
    $scope.toHtml = function(str) {
        var html = str.replace(/math.*x/ig, 'math<sup>x<\/sup>');
        $scope.safeHtml = $sce.trustAsHtml(html);
      };
  }])

  .directive('mathX', function(){

    return {
      restrict: 'E',
      scope: {
        input: '=input'
      },
      template: '<span ng-controller="mathxCtr" ng-bind-html="safeHtml">{{toHtml(input)}}</span>'
    };

  });
