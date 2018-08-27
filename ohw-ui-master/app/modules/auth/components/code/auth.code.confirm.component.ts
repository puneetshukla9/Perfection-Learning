'use strict';

import { Input, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter';
import { AuthStateService } from './../../services/auth.state.service';
import { Router } from '@angular/router';

@Component({
	selector: 'code-confirm',
	providers: [EmitterService, AuthStateService],
	templateUrl: require('./auth.code.confirm.html')
})

export class CodeConfirmComponent {

	@Input() code;
	@Input() order;
	@Input() courseId;
	@Input() courseName;
	@Input() isTeacherEdition;
	@Input() createStudentOnFly;
	@Input() userType;
	@Input() schoolInfo;
	@Input() isStudentReset = false;
	@Input() noSeats;
	@Input() error = false;

	constructor(private router: Router, public AuthStateService: AuthStateService, public EmitterService: EmitterService) {}

	ngOnInit() {
		this.isStudentReset = AuthStateService.id('auth').get('studentReset');
		this.code = AuthStateService.id('auth').get('code');
		this.schoolInfo = AuthStateService.id('auth').get('school');
		if (!this.isStudentReset) {
			this.order = AuthStateService.id('auth').get('order');
			this.courseId = AuthStateService.id('auth').get('courseId');
			this.courseName = AuthStateService.id('auth').get('courseName');
			this.isTeacherEdition = AuthStateService.id('auth').get('isTeacherEdition');
			this.createStudentOnFly = AuthStateService.id('auth').get('createStudentOnFly');
			// userType added to allow confirmation page to display correct student type.
			// With the addition of createStudentOnFly, 'teacher' shouldn't be hardcoded.
			this.userType = this.createStudentOnFly ? 'student' : 'teacher';
			this.noSeats = parseInt(this.order.remaining_seats, 10) < 1;
			this.isStudentReset = AuthStateService.id('auth').get('studentReset');
			this.isStudentRegistrationCode = AuthStateService.id('auth').get('isStudentRegistrationCode');
			if (!_.has(this.order, 'book_name')) this.error = true;
		}
	}

	handleClick() {
		// Teachers and any admins can purchase TE products.
		// We don't allow students to purchase a TE product.
		// [...a later development...]
		// We do, however, allow students to be created on the fly in certain cases. (See auth.code.components.)
		if (this.isTeacherEdition || this.createStudentOnFly) {
			this.router.navigate(['/auth/user/email']); // create-teacher']);
		} else if (this.isStudentReset || !this.isTeacherEdition) {
			this.router.navigate(['/auth/user/username']);
		} else {
			this.error = true;
			// this.router.navigate(['/auth/user/username']); // create-student']);
		}
	}

}
