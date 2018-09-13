'use strict';

var template = require('./save-button.html');
import * as $ from 'jquery';

export default function($timeout, $rootScope, $state) {

    function evalRoute(arr, state) {
      return _.indexOf(arr, state) >= 0;
    }

    /*
      Allows the save button to be hidden immediately for indicated states.
    */
    var elementHideStates = ['libraryApp'];
    function conditionallyHideElement(el) {
      elementHideStates.forEach(st => {
        let re = new RegExp('^' + st);
        if (re.test($state.current.name)) {
          $(el).hide();
        }
      });
    }

    /*
      Shows or hides the Done button based on the 'active' state property.
    */
    function checkRoute(elem, active, name) {
      var result = evalRoute(active, name);
      if (result) {
        $(elem).show();
      } else {
        $(elem).hide();
      }
    }

    return {
      restrict: 'A',
      templateUrl: template,
      scope: {
        done: '=',
        active: '='
      },
      transclude: false,
      link: function(scope, elem, attrs) {
        var navigate;
        conditionallyHideElement(elem);
        checkRoute(elem, scope.active, $state.current.name);

        $rootScope.$on('$stateChangeSuccess', function(e, state) {
          checkRoute(elem, scope.active, state.name);
        });

        $rootScope.$on('save button start', function(e) {
          scope.saving = true;
        });

        $rootScope.$on('save button end', function(e) {
          scope.saving = false;
          if (navigate) {
            navigate = null;
          }
        });

        scope.activate = function(tab) {
          // saving is now handled through here
          if (!scope.saving) {
          } else {
            navigate = tab;
          }
        };

        scope.goTo = function(state) {
          $state.go(scope.done);
        };

      }
    };
  };
