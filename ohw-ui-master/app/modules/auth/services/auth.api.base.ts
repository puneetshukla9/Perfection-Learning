'use strict';

var w = window.location.hostname;
w ="localhost";
var p = window.location.protocol;
var t = window.location.port;

const HOST_MAP = {
	base: { local: 'test-ohw.kineticmath.com', production: w },
	rest: { local: 'test-ohw.kineticmath.com', production: w },
	login: { local: 'test.kineticmath.com', production: w },
	order: { local: 'test.kineticbooks.com', production: w },
	trialTest: { local: 'test-ohw.kineticmath.com', production: w },
	trial: {
		local: 'test.kineticmath.com',
		qa: 'test.kineticmath.com',
		production: 'www.kineticmath.com' //  http://www.kineticmath.com/trial/trialendpt.php/username'
	}
};

const URI_MAP = {
	base: { local: 'rest/endpoint.php/', production: 'api/endpoint/' },
	rest: { local: 'rest/rest.php/', production: 'api/rest/' },
	login: { local: 'rest/', production: 'api/login/' },
	order: { local: 'order/order.php/', production: 'api/order/' },
	trialTest: { local: 'rest/test_trial/trial/trialendpt.php/', production: 'api/trial/' },
	trial: { local: 'trial/trialendpt.php/', qa: 'trial/trialendpt.php/', production: 'trial/trialendpt.php/' }
};

export class APIBase {

	isLocal = false;
	url = {};

	constructor() {
		this.init();
	}

	init() {
		for (var key in URI_MAP) { this.set(key); }
	}

	get(type) {
		return this.url[type];
	}

	getAll() {
		var response = {};
		for (var key in URI_MAP) { response[key] = this.get(key); };
		return response;
	}

	set(type) {
		if (w === 'localhost') {
			this.url[type] = `${p}//${HOST_MAP[type].local}/${URI_MAP[type].local}`;
		} else {
			if (w.indexOf('qa') > -1 && type === 'trial' ) {
				this.url[type] = `${p}//${HOST_MAP[type].qa}/${URI_MAP[type].qa}`;
			} else {
				this.url[type] = `${p}//${HOST_MAP[type].production}/${URI_MAP[type].production}`;
			}
		}

		return this.url[type];
	}

};
