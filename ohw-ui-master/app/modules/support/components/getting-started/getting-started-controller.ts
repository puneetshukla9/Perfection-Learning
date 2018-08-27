'use strict';

export default function($scope, $rootScope, $sce, $uibModal) {

		var GETTING_STARTED = {
			amsco: '//files.kineticbooks.com/guides/GettingStarted_AMSCO_Instructors.pdf',
			mathx: '//files.kineticbooks.com/guides/mathx_user_manual.pdf',
			fpp: '//files.kineticbooks.com/guides/fpp-user-manual.pdf'
		};

	$scope.view = {};

	$scope.download = function() {
	  window.open(GETTING_STARTED[$rootScope.product], '_blank');
	};

	$scope.toTrusted = function(html) {
	  return $sce.trustAsHtml(html);
	};

	$scope.view.videos = [
	  { caption: 'Remove Assignment',
		embedCode: '158097186',
		product: 'amsco' },
	  { caption: 'Create Assignment',
		embedCode: '158097185',
	 	product: 'amsco' },
	  { caption: 'Edit Assignment',
		embedCode: '158097184',
	 	product: 'amsco' },
	  { caption: 'Print Assignment',
		embedCode: '158097183',
	 	product: 'amsco' },
	  { caption: 'Preview MathX',
	  	embedCode: '158097181',
		product: 'amsco' },
		{ caption: 'Set Up Class',
		  embedCode: '174397222',
		  product: 'mathx' },
		{ caption: 'Upload Students',
		  embedCode: '174397224',
		  product: 'mathx' },
		{ caption: 'Print Student Login Information',
		  embedCode: '174397218',
		  product: 'mathx' },
		{ caption: 'Student Sign In',
		  embedCode: '174397226',
		  product: 'mathx' },
		{ caption: 'Create Assignment',
		  embedCode: '174397219',
		  product: 'mathx' },
			{ caption: 'Edit Assignment',
				embedCode: '158097184',
				product: 'mathx'
			},
			{ caption: 'Remove Assignment',
				embedCode: '158097186',
				product: 'mathx'
			},
			{ caption: 'Print Assignment',
				embedCode: '158097183',
				product: 'mathx'
			},
			{ caption: 'Data-Driven Instruction Using Reports',
				embedCode: '174397221',
				product: 'mathx'
			},
			{ caption: 'Grade Student Work',
				embedCode: '174397217',
				product: 'mathx'
			},
			{ caption: 'Reset Student Passwords',
				embedCode: '174397220',
				product: 'mathx'
			},

			{ caption: 'Set Up Class',
			  embedCode: '174397222',
			  product: 'fpp' },
			{ caption: 'Upload Students',
			  embedCode: '174397224',
			  product: 'fpp' },
			{ caption: 'Print Student Login Information',
			  embedCode: '174397218',
			  product: 'fpp' },
			{ caption: 'Student Sign In',
			  embedCode: '174397226',
			  product: 'fpp' },
			{ caption: 'Create Assignment',
			  embedCode: '174397219',
			  product: 'fpp' },
				{ caption: 'Edit Assignment',
					embedCode: '158097184',
					product: 'fpp'
				},
				{ caption: 'Remove Assignment',
					embedCode: '158097186',
					product: 'fpp'
				},
				{ caption: 'Print Assignment',
					embedCode: '158097183',
					product: 'fpp'
				},
				{ caption: 'Data-Driven Instruction Using Reports',
					embedCode: '174397221',
					product: 'fpp'
				},
				{ caption: 'Grade Student Work',
					embedCode: '174397217',
					product: 'fpp'
				},
				{ caption: 'Reset Student Passwords',
					embedCode: '174397220',
					product: 'fpp'
				}
	];

	$scope.view.open = function(video) {
	  var result = $uibModal.open({
		size: 'lg',
		templateUrl: 'getting-started/getting-started-video.html',
		controller: 'GettingStartedVideoController',
		backdrop: 'static',
		backdropClass: 'backdrop-dark',
		resolve: {
		  video: function() { return video; },
		  toTrusted: function() { return $scope.toTrusted; }
		}
	  });
	};

  };
