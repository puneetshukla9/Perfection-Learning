'use strict';

import { Input, Output, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';
import { AuthAPIService } from './../../services/auth.api.ts';
import { AuthStateService } from './../../services/auth.state.service';
import { ConfigService } from './../../services/auth.config.service';
import { Router } from '@angular/router';

@Component({
	selector: 'teacher-create',
	providers: [AuthStateService, EmitterService, AuthAPIService],
	templateUrl: require('./auth.create.html')
})

export class CreateTeacherComponent {

	@Input() view = 'initial';
	user = {};

	constructor(
		private router: Router,
		public OHW: ConfigService,
		public EmitterService: EmitterService,
		public API: AuthAPIService,
		public AuthStateService: AuthStateService) {}

	ngOnInit() {
		this.user.email = AuthStateService.id('auth').get('email');
	}

	submit() {
		AuthStateService.id('auth').set('password', this.user.password);
		var code = AuthStateService.id('auth').get('code');
		var email = AuthStateService.id('auth').get('email');
		let payload = {
			first: this.user.firstName,
			last: this.user.lastName,
			email: email,
			pw: this.user.password,
			token: code,
			wrap_output: true
		};
		this.API.userCreate(payload).subscribe(
			(response) => {
				AuthStateService.id('auth').set('userCreate', response);
				var payload = { email: email, pw: this.user.password, wrap_output: true };
				this.API.login(payload).subscribe(
					(response) => {
						// teachers do not need to create security questions
						this.router.navigate(['/auth/user/complete']);
					},
					(error) => { console.log(`error${error}`); }
				);
			},
			(error) => { console.log(error); }
		);
	}

}
