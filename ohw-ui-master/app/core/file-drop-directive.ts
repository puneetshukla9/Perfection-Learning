'use strict';

import * as $ from 'jquery';

export default function($rootScope) {

		return {
	  	restrict: 'A',
	  	scope: {
	  		config: '=',
				callback: '='
	  	},
	  	link: function(scope, element, attrs) {

	  		var checkSize, isTypeValid, handleDrag, validMimeTypes;
				var config = scope.$eval(attrs.config);

	  		handleDrag = function(event) {
	  			if (event) event.preventDefault();
	  			event.dataTransfer.effectAllowed = 'copy';
	  			event.dataTransfer.dropEffect = 'copy'; // fireFox has this one default to 'move', without this it won't work!!!
	  			return false;
	  		};

				// size given in MB
	  		var validSize = function(size) {
					if (config.maxSize > 0 && (size / 1024) / 1024 < config.maxSize) {
	  				return true;
	  			} else {
	  				$rootScope.$broadcast('notification error', 'File must be smaller than ' + attrs.maxFileSize + ' MB');
	  				return false;
	  			}
	  		};

	  		var validType = function(fileObj) {
					var type = fileObj.type;

					if (!type || type === '') {
          //ie js File obj no type, attempt to get it from file name
            type = fileObj.name.substr(fileObj.name.lastIndexOf('.') + 1).toLowerCase();
          }

					var hasType = _.find(config.types, { type: type });
					if (!hasType) {
						var fileTypes = _.uniq(_.map(config.types, 'description')).join(', ');
						var message = `Only ${fileTypes} files can be uploaded.`;
						$rootScope.$broadcast('notification error', { message: message });
						return false;
					} else {
						return true;
					}
	  		};

	  		element.bind('dragover', handleDrag);
	  		element.bind('dragenter', handleDrag);

	  		element.bind('drop', function(e) {
  				var file, read, hasValidSize, hasValidType;
  				if (e) e.preventDefault();
				file = e.dataTransfer.files[0];
				if (!file) return;
				if (config.maxSize && !validSize(file.size)) return;
				if (config.types && !validType(file)) return;
				$(element).attr('value', '');
				read = new FileReader();
				read.readAsText(file);
  				read.onload = function(e) {
					var data = read.result;
					scope.callback(data);
				};
  			});
		}
	  };
};
