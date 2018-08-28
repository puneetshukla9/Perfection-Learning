'use strict';
import * as $ from 'jquery';

export default function() {

    var DEFAULT_MASK_LENGTH = 0; // Bug Board: Mask deemed confusing, as it gave the impression the field might have been populated already.
    var MASK = '•';

    function buildMask(len) {
      var str = '';
      for (var i = 0; i < len; i++) {
        str += MASK;
      }
      return str;
    }

    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModel) {
        scope.modelValue = ngModel.$modelValue;

        scope.$watch(function () {
          return ngModel.$modelValue;
        }, function(newValue) {
          scope.modelValue = newValue;
          if (scope.modelValue && scope.modelValue.length) {
            scope.mask = buildMask(scope.modelValue.length);
          } else {
            scope.mask = buildMask(DEFAULT_MASK_LENGTH);
            if (!$(elem).is(':focus')) elem.val(scope.mask);
          }
        });

        function init() {
          scope.mask = buildMask(DEFAULT_MASK_LENGTH);
          elem.val(scope.mask);
        }

        init();

        elem.on('focus', function() {
          elem.val(scope.modelValue || '');
        });

        elem.on('blur', function() {
          elem.val(scope.mask);
        });

      }
    };
  };
