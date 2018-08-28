'use strict';

import * as $ from 'jquery';

export default function($rootScope) {

    return {
      restrict: 'A',
      scope: {
        callback: '='
      },
      link: function(scope, elem, attrs) {

        var fileInput = angular.element('<input type="file" />');
        var allowedTypes = scope.$eval(attrs.types);

        fileInput.css({ display: 'none' });

        var element = angular.element(elem);
        element.append(fileInput);

        var button = element.children()[0];

        $(button).bind('click', function(e) {
          $(fileInput).trigger('click');
        });

        $(fileInput).on('change', function(e) {
          var file = (e.srcElement || e.target).files[0];
    		  e.target.value = '';

          if (!file) return;

          var theFileType = file.type;

          if (!theFileType || theFileType === '') {
          //ie js File obj no type, attempt to get it from file name
            theFileType = file.name.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
          }

          var hasType = _.find(allowedTypes, { type: theFileType });

          if (!hasType) {
      			  var fileTypes = _.uniq(_.map(allowedTypes, 'description')).join(', ');
      			  var message = `Only ${fileTypes} files can be uploaded.`;
      			  $rootScope.$broadcast('notification error', { message: message });
      			  return;
    		  }

          scope.fileName = file.name;
          scope.$apply();
          var read = new FileReader();
          read.readAsText(file);
          read.onloadend = function(e){
            var data = read.result;
            scope.callback(data);
          };
        });

      }
    };

  };
