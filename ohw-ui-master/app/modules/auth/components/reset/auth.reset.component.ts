'use strict';

import { Input, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';
import { AuthStateService } from './../../services/auth.state.service';
import { AuthAPIService } from './../../services/auth.api';
import { Autofocus } from './../../directives/autofocus.directive.ts';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'reset',
	providers: [AuthAPIService, EmitterService, AuthStateService],
	templateUrl: require('./auth.reset.html')
})

export class ResetComponent {

	@Input view = '';
	@Input user = { password: '', repeatPassword: '' };

	isSecurity: boolean = false;
	isStudent: boolean = false;

	constructor(
		public router: Router,
		public activatedRoute: ActivatedRoute,
		public EmitterService: EmitterService,
		public AuthStateService: AuthStateService,
		public API: AuthAPIService) {}

	ngOnDestroy() {
		this.routeSubscription.unsubscribe();
	}

	ngOnInit() {
		var userId = AuthStateService.id('auth').get('userId');
		var username = AuthStateService.id('auth').get('username');
		var email = AuthStateService.id('auth').get('email');

		if (email) localStorage.setItem('email', email);
		if (username) localStorage.setItem('username', username);

		this.routeSubscription =
			this.activatedRoute.queryParams
				.subscribe(
					params => {
						var { token, security, student, imported } = params;
						if (token && token.length) {
							this.view = 'password';
							this.token = token;
						} else if (security) {
							this.view = 'password';
							this.isSecurity = true;
						} else if (student) {
							this.view = 'password';
							this.isStudent = true;
						} else if (imported) {
							this.view = 'imported';
							this.isImported = true;
						}
					}
				);

		if (!this.token && !this.isSecurity && !this.isStudent && !this.isImported) {
			console.log('no token found and not in security mode, sending email');
			this.view = 'confirmSendToEmail';
		}
	}

	// because of the click link in email, persistence is not guaranteed
	// when returning to the page as a new instance of the app will be loaded
	// ensures that we have username and email set so that login can take place
	// without user re-entering their credentials
	getLocalStorageUsernameAndEmail() {
		var username = AuthStateService.id('auth').get('username');
		var email = AuthStateService.id('auth').get('email');
		if (username || email) return;
		username = localStorage.getItem('username');
		email = localStorage.getItem('email');
		AuthStateService.id('auth').set('username', username);
		AuthStateService.id('auth').set('email', email);
		localStorage.clear();
	}

	updateStudent() {
		var tempPassword = AuthStateService.id('auth').get('code');
		var newPassword = this.user.password;
		var username = AuthStateService.id('auth').get('username');
		var payload = { temp_pw: tempPassword, new_pw: newPassword, email: username };
		this.API.resetStudentPasswordFromCode(payload).subscribe(
			(response) => {
				AuthStateService.id('auth').set('password', this.user.password);
				var payload = { email: username, pw: this.user.password, wrap_output: true };
				this.API.login(payload).subscribe(
					(response) => {
						// at this point authenticated as a student
						this.router.navigate(['/auth/user/security/create']);
					},
					(error) => { console.log(`error${error}`); }
				);
			},
			(error) => {
				this.view = 'errorUpdateStudent';
			}
		);
	}

	updateViaSecurityAnswers() {
		var userId = AuthStateService.id('auth').get('userId');
		var answer1 = AuthStateService.id('auth').get('securityAnswer1');
		var answer2 = AuthStateService.id('auth').get('securityAnswer2');
		this.API.resetPasswordWithAnswers(userId,
			{ new_pw: this.user.password, security_a_1: answer1, security_a_2: answer2 }).subscribe(
				(response) => {
					if (response.status === 'success') {
						this.getLocalStorageUsernameAndEmail();
						AuthStateService.id('auth').set('password', this.user.password);
						this.view = 'success';
						// login user automagically
						this.router.navigate(['/auth/user/complete']); //, { queryParams: { auto: true }});
					} else {
						this.view = 'errorSecurityQuestions';
					}
				},
				(error) => {
					this.view = 'error';
				}
			);
	}

	updateViaToken() {
		var payload = {
			pw: this.user.password,
			token: this.token,
			wrap_output: true
		};
		this.API.changePasswordWithToken(payload).subscribe(
			(response) => {
				if (response.status === 'success') {
					this.getLocalStorageUsernameAndEmail();

					var thisUName = AuthStateService.id('auth').get('username');

					if (thisUName === '' || thisUName === null) {
						AuthStateService.id('auth').set('username', response.data.email);
						AuthStateService.id('auth').set('email', response.data.email);
					}

					AuthStateService.id('auth').set('password', this.user.password);
					this.view = 'success';
					// login user automagically
					this.router.navigate(['/auth/user/complete']); //, { queryParams: { auto: true }});
				} else {
					this.view = 'error';
				}
			},
			(error) => {
				this.view = 'error';
			}
		);
	}

	updatePassword() {
		if (this.isSecurity) {
			this.updateViaSecurityAnswers();
		} else if (this.token) {
			this.updateViaToken();
		} else if (this.isStudent) {
			this.updateStudent();
		} else {
			this.view = 'error';
		}
	}

	sendToEmail() {
		var username = AuthStateService.id('auth').get('username');
		var email = AuthStateService.id('auth').get('email');
		this.API.resetPassword({ email: username || email, wrap_output: true }).subscribe(
			(response) => {
				this.view = 'sent';
			},
			(error) => {
				this.view = 'error';
			}
		);
	}

}
