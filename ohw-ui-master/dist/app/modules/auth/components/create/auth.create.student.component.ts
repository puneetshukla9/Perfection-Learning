'use strict';

import { Input, Output, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';
import { AuthAPIService } from './../../services/auth.api.ts';
import { AuthStateService } from './../../services/auth.state.service';
import { Router } from '@angular/router';

@Component({
	selector: 'student-create',
	providers: [AuthStateService, EmitterService, AuthAPIService],
	templateUrl: require('./auth.create.html')
})

export class CreateStudentComponent {

	@Input() view = 'firstName';
	user = {};

	constructor(
		private router: Router,
		public EmitterService: EmitterService,
		public API: AuthAPIService,
		public AuthStateService: AuthStateService) {}

	validate() {
		return true;
	}

	submit() {
		if (this.validate()) {
			AuthStateService.id('auth').set('password', this.user.password);

			var code = AuthStateService.id('auth').get('code');
			var username = AuthStateService.id('auth').get('username');
			var createStudentOnFly = AuthStateService.id('auth').get('createStudentOnFly');
			// Students created on the fly (see auth.code.component.ts) are taken to the Email: form.
			// In such cases, there is no 'username'; instead, we use 'email', just as for teachers.
			if (createStudentOnFly) {
				username = AuthStateService.id('auth').get('email');
			}
			let payload = {
				first: this.user.firstName,
				last: this.user.lastName,
				email: username,
				pw: this.user.password,
				token: code,
				wrap_output: true
			};
			this.API.userCreate(payload).subscribe(
				(response) => {
					AuthStateService.id('auth').set('userCreate', response);
					var payload = { email: username, pw: this.user.password, wrap_output: true };
					this.API.login(payload).subscribe(
						(response) => {
							// at this point authenticated as a student
							this.router.navigate(['/auth/user/security/create']);
						},
						(error) => { console.log(`error${error}`); }
					);
				},
				(error) => { console.log(error); }
			);
		}
	}

}
