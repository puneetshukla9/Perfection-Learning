'use strict';

export default function() {

	var categories = [
			{id: 'all', text: 'All Categories'},
			{id: 'homework', text: 'Homework', icon: 'icon-homework-h'},
			{id: 'quiz', text: 'Quiz', plural: 'Quizzes', icon: 'icon-quiz-q'},
			{id: 'test', text: 'Test', plural: 'Tests', icon: 'icon-test-t'},
			{id: 'ipractice', text: 'i-Practice', icon: 'icon-ipractice-ip'}
	];

	var map = makeMap();

	function categoryList() {
		var out = [];

		_.forEach(categories, function(cat) {
			if (cat.id !== 'all')
				out.push(cat.id);
		});

		return out;
	}

	function makeMap() {
		var out = {};

		_.forEach(categories, function(cat) {
			if (cat.id !== 'all')
				out[cat.id] = {
					name: cat.text,
					icon: cat.icon
				};
		});

		return out;
	}

	function getMap() {
		return _.cloneDeep(map);
	}

	function get() {
		return _.cloneDeep(categories);
	}

	// Public API
	return {
		categoryList: categoryList,
		getMap: getMap,

		// DataProvider API
		get: get
	};

};
