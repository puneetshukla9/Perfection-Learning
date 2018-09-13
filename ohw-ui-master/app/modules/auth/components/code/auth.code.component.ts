'use strict';

import { Input, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter';
import { AuthAPIService } from './../../services/auth.api';
import { AuthStateService } from './../../services/auth.state.service';
import { Router } from '@angular/router';

// Test to see if new teacher should be created on the fly.
function createTeacher(code, data) {
	var result = false;
	// check for is_te flag or 16-digit code.
	if (!!parseInt(data.is_te, 10)) {
		result = true;
	} else if (/^\d{16}$/.test(code)) {
		result = true;
	}

	return result;
};

// Test to see if new student should be created on the fly, given registration code and email address.
function createStudentOnFly(data) {
	// test for non-zero / non-blank course_id. If exists, assume it's not a teacher code but for creating students on the fly.
	var result = data.course_id;

	return result;
};

@Component({
	selector: 'auth-code',
	providers: [EmitterService, AuthStateService, AuthAPIService],
	templateUrl: require('./auth.code.html')
})

export class CodeComponent {

	@Input() code = '';

	ngOnInit() {
		// clear studentReset flag, so user will still be prompted for a password on login.
		AuthStateService.id('auth').set('studentReset', false);
	}

	constructor(
		private router: Router,
		public AuthStateService: AuthStateService,
		public API: AuthAPIService,
		public EmitterService: EmitterService) {}

	handleClick() {
		var self = this;
		AuthStateService.id('auth').set('code', this.code);
		this.API.getCode(this.code).subscribe(
			(response) => {
				if (response.status === 'NOT_FOUND') {
					AuthStateService.id('auth').set('studentReset', true);
					self.router.navigate(['/auth/code/confirm']);
				} else {
					AuthStateService.id('auth').set('studentReset', false);
					AuthStateService.id('auth').set('order', response.data);
					AuthStateService.id('auth').set('isTeacherEdition', createTeacher(this.code, response.data));
					AuthStateService.id('auth').set('createStudentOnFly', createStudentOnFly(response.data));
					AuthStateService.id('auth').set('isStudentRegistrationCode', !!response.data.course_id);
					AuthStateService.id('auth').set('courseId', response.data.course_id);
					AuthStateService.id('auth').set('courseName', response.data.course_name);

					this.API.getSchoolInfoById(response.data.s_id).subscribe(
						(response) => {
							AuthStateService.id('auth').set('school', response.data);
							self.router.navigate(['/auth/code/confirm']);
						},
						(error) => {
							console.log(error);
							self.router.navigate(['/auth/code/confirm']);
						}
					);
				}
			},
			(error) => {
				console.log(error);
			}
		);
	}

}
