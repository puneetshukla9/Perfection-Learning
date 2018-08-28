'use strict';

import { NgZone, Input, Output, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter';
import { AuthAPIService } from './../../services/auth.api';
import { AuthStateService } from './../../services/auth.state.service';
import { ConfigService } from './../../services/auth.config.service.ts';
import { Router } from '@angular/router';

@Component({
	selector: 'password',
	providers: [ConfigService, EmitterService, AuthAPIService, AuthStateService],
	templateUrl: require('./auth.password.html')
})

export class PasswordComponent {

	@Input() password = '';
	@Input() view = 'password';
	@Input() isForgotPassword = false;
	@Input() addSuccess = false;

	constructor(
		public OHW: ConfigService,
		public AuthStateService: AuthStateService,
		public router: Router,
		public EmitterService: EmitterService,
		public API: AuthAPIService,
		public zone: NgZone
	) {}

	forgotPassword() {
		this.isForgotPassword = true;
		var username = AuthStateService.id('auth').get('username');
		var email = AuthStateService.id('auth').get('email');
		if (username && username.indexOf('@') === -1) {
			this.router.navigate(['/auth/user/security']);
		} else {
			this.router.navigate(['/auth/user/reset']);
		}
	}

	back() {
		console.log('back');
		this.view = 'password';
	}

	addToAccount(payload) {
		var token = AuthStateService.id('auth').get('code') || '';
		var userRegisterPayload = _.extend(payload, { token: token });
		this.API.userRegister(userRegisterPayload).subscribe(
			(response) => {
				this.addSuccess = true;
				this.zone.run(() => { self.view = 'regSuccess'; });
				this.login(payload);
			},
			(error) => {
				this.zone.run(() => { self.view = 'errorCouldNotAdd'; });
			}
		);
	}

	login(payload) {
		var self = this;
		this.API.login(payload).subscribe(
			(response) => {
				this.OHW.load();
			},
			(error) => {
				if (error.status === 402) {
					this.zone.run(() => { self.view = 'errorNoBook'; });
				} else if (error.status === 410) {
					this.zone.run(() => {
						console.log('Login - navigating to password reset');
						this.router.navigate(['/auth/user/reset'], { queryParams: { imported: true }});
					});
				} else {
					self.view = 'error';
				}
			 }
		);
	}

	handleSubmit() {
		var self = this;

		var username = AuthStateService.id('auth').get('username') || AuthStateService.id('auth').get('email');
		var payload = { email: username, pw: this.password, wrap_output: true };
		var addToAccount = false || AuthStateService.id('auth').get('addToAccount');
		// If redirect is set, add it to payload.
		var fromRedirect = AuthStateService.id('auth').get('from-redirect');
		if (fromRedirect) {
			payload.fromRedirect = fromRedirect;
		}

		if (addToAccount && !this.addSuccess) {
			this.addToAccount(payload);
		} else {
			this.login(payload);
		}

	}

}
