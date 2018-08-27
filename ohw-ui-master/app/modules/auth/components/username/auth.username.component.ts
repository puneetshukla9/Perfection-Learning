'use strict';

import { Input, Output, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';
import { AuthAPIService } from './../../services/auth.api.ts';
import { AuthStateService } from './../../services/auth.state.service.ts';
import { Router } from '@angular/router';

@Component({
	selector: 'username',
	providers: [EmitterService, AuthStateService, AuthAPIService],
	templateUrl: require('./auth.username.html')
})

export class UsernameComponent {

	@Input() username = '';
	@Input() view = 'username';
	isStudentReset = false;

	constructor(
		private router: Router,
		public EmitterService: EmitterService,
		public API: AuthAPIService,
		public AuthStateService: AuthStateService) {}

	studentReset() {
		var username = this.username;
		var code = AuthStateService.id('auth').get('code');
		this.API.checkCode({ email: username, password: code }).subscribe(
			(response) => {
				response = response.data || response;
				AuthStateService.id('auth').set('username', username);
				if (response === true) {
					this.router.navigate(['/auth/user/reset'], { queryParams: { student: true }});
				} else {
					this.view = 'errorNoMatch';
				}
			},
			(error) => {
				this.view = 'error';
				console.log(error);
			}
		);
	}

	traditional() {
		var username = this.username;
		this.API.checkUsernameOrEmail({ username: username }).subscribe(
			(response) => {
				response = response.data || response; // todo: remove when API fixed
				AuthStateService.id('auth').set('username', username);
				if (response.exists) {
					AuthStateService.id('auth').set('userId', response.user_id);
					this.router.navigate(['/auth/login/password']);
				} else {
					this.view = 'error';
				}
			},
			(error) => { console.log(error); }
		);
	}

	check() {
		this.isStudentReset = AuthStateService.id('auth').get('studentReset');
		if (this.isStudentReset) {
			this.studentReset();
		} else {
			this.traditional();
		}
	}

}
