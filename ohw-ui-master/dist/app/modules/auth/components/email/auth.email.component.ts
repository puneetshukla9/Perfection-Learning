'use strict';

import { Input, Output, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';
import { AuthAPIService } from './../../services/auth.api.ts';
import { AuthStateService } from './../../services/auth.state.service.ts';
import { Autofocus } from './../../directives/autofocus.directive.ts';
import { Router } from '@angular/router';

@Component({
	selector: 'email',
	providers: [EmitterService, AuthStateService, AuthAPIService],
	templateUrl: require('./auth.email.html')
})

export class EmailComponent {

	@Input() email = '';
	@Input() error = false;

	constructor(
		public AuthStateService: AuthStateService,
		public router: Router,
		public EmitterService: EmitterService,
		public API: AuthAPIService) {}

	addToAccount() {
		// if the email exists and the code is valid,
		// get the password and use those credentials to login
		// then add the requisite class to that user
		AuthStateService.id('auth').set('addToAccount', true);
		this.router.navigate(['/auth/login/password']);
	}

	check() {
		var email = this.email;
		var isTeacherEdition = AuthStateService.id('auth').get('isTeacherEdition');
		var createStudentOnFly = AuthStateService.id('auth').get('createStudentOnFly');
		this.API.checkUsernameOrEmail({ username: email }).subscribe(
			(response) => {
				AuthStateService.id('auth').set('email', email);
				response = response.data || response;
				if (response.exists) {
					AuthStateService.id('auth').set('userId', response.user_id);
					this.error = true;
				} else {
					// Once upon a time, this was just for teachers, and all that was necessary was to route to create-teacher.
					// Later, however, a need was recognized to be able to create students on the fly, so we're basically using
					// the same path (/auth/users/email) as for creating a new teacher account, only we're instead creating
					// a student account.
					// The createStudentOnFly condition is in auth.code.component.ts.
					if (createStudentOnFly) {
						this.router.navigate(['/auth/user/create-student']);
					} else {
						this.router.navigate(['/auth/user/create-teacher']);
					}
				}
			},
			(error) => { console.log(error); }
		);
	}

}
