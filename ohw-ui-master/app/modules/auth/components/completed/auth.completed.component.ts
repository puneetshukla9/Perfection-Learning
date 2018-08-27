'use strict';

import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationService } from './../../services/auth.validation.service.ts';
import { ConfigService } from './../../services/auth.config.service.ts';
import { AuthAPIService } from './../../services/auth.api.ts';
import { AuthStateService } from './../../services/auth.state.service.ts';
import { EmitterService } from './../../services/auth.emitter.ts';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
	selector: 'completed',
	templateUrl: require('./auth.completed.html')
})

export class CompletedComponent {

	@Input() view = 'username';
	@Input() user = {};
	@Input() validation = {};

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private ValidationService: ValidationService,
		private OHW: ConfigService,
		private API: AuthAPIService,
		private AuthStateService: AuthStateService,
		private EmitterService: EmitterService
	) {}

	ngOnInit() {
		this.routeSubscription =
		this.activatedRoute.queryParams
			.map(params => params.auto)
			.subscribe((auto) => { if (auto) this.handleClick(true); });
	}

	ngOnDestroy() {
		this.routeSubscription.unsubscribe();
	}

	handleClick(auto = false) {
		if (auto) { EmitterService.get('spinner').emit(true); }

		var username = AuthStateService.id('auth').get('username');
		var password = AuthStateService.id('auth').get('password');
		var email = AuthStateService.id('auth').get('email');
		var payload = { email: email || username, pw: password, wrap_output: true };
		this.API.login(payload).subscribe(
			(response) => {
				if (auto) { EmitterService.get('spinner').emit(false); }
				this.OHW.load(); },
			(error) => {
				if (auto) { EmitterService.get('spinner').emit(false); }
				console.log(`error${error}`);
			}
		);
	}

}
