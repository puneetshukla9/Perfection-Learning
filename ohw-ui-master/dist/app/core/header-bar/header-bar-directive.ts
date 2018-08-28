'use strict';

require('./header-bar.less');

var template = require('./header-bar.html');
var mathxLogo = require('./../../assets/images/header-logo-mathx.svg');
var amscoLogo = require('./../../assets/images/header-logo-amsco.svg');
var names = require('./../../../config/app-menu-config.json');

export default function(AppState, $state) {

		return {
			restrict: 'A',
			templateUrl: template,
			transclude: true,
			link: function(scope, elem, attrs) {

				scope.$on('$stateChangeSuccess', function(e, state) {
				 	var name = AppState.getModuleName(state);
					scope.modName = names[name];
				});

				var setLogo = (course) => {
					if (scope.product === 'amsco') {
						// Per Jesse, in card AMSCO text overlaps New Features button: "No, we shouldn't have that logo there at all."
						//scope.logo = amscoLogo;
						//scope.showLogo = true;
					} else {
						// Remove MathX logo from header in all three modules in online homework
						//scope.logo = mathxLogo;
					}
				};

				setLogo();

			}
		};
	};
