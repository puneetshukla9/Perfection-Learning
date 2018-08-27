'use strict';

import { NgZone } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { UpgradeAdapter } from '@angular/upgrade';
import { AppModule } from './../auth.module.ts';
import { moduleRef } from './../../../auth.bootstrap.ts';
import { providers } from './../auth.module.ts';
import { AuthAPIService } from './../services/auth.api.ts';
import { AuthStateService } from './../services/auth.state.service.ts';

var ohw = require('./../../../app');

const WRAP_OUTPUT = true;
const ENABLE_CACHE = false;
const PROBLEM_URL = `//www.google.com`;

@Injectable()
export class ConfigService {

	constructor(
		private API: AuthAPIService,
		private AuthStateService: AuthStateService,
		public zone: NgZone
	) {}

	isEdge() {
		return navigator.userAgent.indexOf('Edge') >= 0;
	}

	load(angular2Module) {
		var cache = ENABLE_CACHE;
		var self = this;
		if (this.isEdge()) { cache = false; }
		Observable.forkJoin([this.API.setWrap({ wrap_output: WRAP_OUTPUT }), this.API.setCache({ enable_cache: cache })])
			.subscribe(() => {
				Observable.forkJoin([this.API.getAppState(), this.API.getPrefs()])
					.subscribe(response => {
						window.ohw = window.ohw || {};
						window.ohw.appConfig = response[0].data;
						window.ohw.curCourse = response[0].data.curCourse;
						window.ohw.prefs = response[1].data;
						window.ohw.allowAutoLogout = AuthStateService.id('auth').get('autologout');
						moduleRef
							.then((ref: NgModuleRef) => ref.destroy()) // destroy the angular 2 login app
							.then((value) => {
								const upgradeAdapter = new UpgradeAdapter(AppModule);
								this.zone.runOutsideAngular(() => {
									upgradeAdapter.bootstrap(document, ['ohw'], { strictDi: false });
								});
							});
					}, (err) => { window.location.href = PROBLEM_URL; });
			}, (err) => { window.location.href = PROBLEM_URL; });
	}

};
