'use strict';

export default function($rootScope) {

    var template = require('./grid-correct-column-template.html');

    return {
      restrict: 'A',
      templateUrl: template,
      scope: {
        col: '='
      },
      link: function(scope, elem, attrs) {

        var name = scope.col.name;
        var appScope = scope.col.grid.appScope;

        appScope.$watchCollection(function() {
          if (_.has(appScope, 'columnsValid')) {
            return appScope.columnsValid[name];
          }
        }, function(n, o) {
          scope.invalid = false;
          for (var i in n) {
            if (!n[i]) {
              scope.invalid = true;
              break;
            }
          }
        }, true);

        elem.bind('click', function() {
          $rootScope.$broadcast('grid correct column resolve', { name: name });
        });
      }
    };

  };
