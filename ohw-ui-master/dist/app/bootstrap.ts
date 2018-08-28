'use strict';

import 'es6-shim';

var angular = require('angular');

import 'reflect-metadata';
import { UpgradeAdapter } from '@angular/upgrade/upgrade'; /* tslint:disable-line */
// import { Injectable } from '@angular/core';
// import { Http } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'zone.js';

import ohwConfig from './../config/application-config.json';

var ohw = require('./app');
var Axios = require('axios');

const upgradeAdapter = new UpgradeAdapter();

var WRAP_OUTPUT = true;
var ENABLE_CACHE = false;

var address;

var p = window.location.protocol;
var w = window.location.hostname;
var a, API = {};
var subdomain, dest;
var autologout = 'true';

if (w === 'ohw.kineticmath.com' || w === 'qa3.kineticmath.com') {
	subdomain = 'www';
	dest = encodeURIComponent(`${p}//${w}`);
} else {
	subdomain = 'test';
	if (w === 'localhost') w += ':8080';
	dest = p + '//' + w; // 'http://qa2.kineticmath.com';
}

var LOGIN_URL = `//${subdomain}.kineticmath.com/login/loginform.html?browser=kb&msg=&after=${dest}`;

if (w.indexOf('localhost') >= 0) {
	w = 'test-ohw.kineticmath.com';
	a = p + '//' + w;
	API.BASE = a + '/rest/endpoint.php/';
	API.REST_BASE = a + '/rest/rest.php/';
} else {
	a = p + '//' + w;
	API.BASE = a + '/api/endpoint/';
	API.REST_BASE = a + '/api/rest/';
}

class BootstrapService {
	constructor(p) {
		this.config = { withCredentials: true };
		this.setWrap = this.setWrap.bind(this);
		this.setCache = this.setCache.bind(this);
		this.getAppState = this.getAppState.bind(this);
		this.getPrefs = this.getPrefs.bind(this);
	}
	setWrap(bool) {
		var payload = { wrap_output: bool };
		return Axios.put(API.BASE + 'output/wrapping/set', payload, this.config);
	}
	setCache(bool) {
		var payload = { enable_cache: bool };
		return Axios.put(API.BASE + 'output/caching/set', payload, this.config);
	}
	getAppState() {
		// This is not the bootstrap function you're looking for.
		// Check the one in util-model.ts or auth.api.ts.
		return Axios.get(API.BASE + 'bootstrap', this.config);
	}
	getPrefs() {
		return Axios.get(API.BASE + 'prefs', this.config);
	}
}
var config = new BootstrapService();

function isEdge() {
	return navigator.userAgent.indexOf('Edge') >= 0;
}

var cache = true;
if (isEdge()) { cache = false; }

if (window.location.search.indexOf('autologout=false') >= 0) {
	autologout = 'false';
}

Promise.all([config.setWrap(true), config.setCache(cache)]).then(t => {
	Promise.all([config.getAppState(), config.getPrefs()]).then(u => {
		window.ohw = window.ohw || {};
		window.ohw.appConfig = u[0].data.data;
		window.ohw.prefs = u[1].data.data;
		if (_.has(window.ohw.appConfig, 'Code') && window.ohw.appConfig.Code === 'NOT_LOGGED_IN') {
			window.location.href = LOGIN_URL + encodeURIComponent(window.location.search);
		} else {
			// important: this is async now
			upgradeAdapter.bootstrap(document, ['ohw'], { strictDi: false });
		}
	})
	.catch((err) => {
		if (_.has(err, 'status') && err.status === 403) {
			window.location.href = LOGIN_URL;
		}
	});
});
