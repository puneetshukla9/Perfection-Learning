'use strict';
import * as $ from 'jquery';
export default function($scope,$http) {

	var self = this;
	self.ready = false;
	self.tester="abcd"
	self.sample=[{
		"text":"Sample 1"
	},{
		"text":"Sample 2"
	},{
		"text":"Sample 3"
	}];
	self.dd=self.sample[0];
	setTimeout(function () {
		$(".accordianHeading").off("click").on("click", function () {
			var id = $(this).attr('data-target');
			if (!$(id).hasClass('open')) {
				$('#accordionWrapper .collapse').removeClass('open').slideUp();
				$(id).addClass('open').slideDown();
			} else {
				$(id).removeClass('open').slideUp();
			}
		});
	
	});
self.gradeBookData;
	$http.get("./app/modules/assignments/components/models/settings.json").then(function (response) {
		console.log(self.gradeBookData);
		self.gradeBookData = response.data;

	});

	//Mitr Code added by puneet
};
