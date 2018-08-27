'use strict';

import { Output, Input, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';
import { AuthStateService } from './../../services/auth.state.service';
import { AuthAPIService } from './../../services/auth.api';
import { Router } from '@angular/router';

@Component({
	selector: 'security-answers',
	templateUrl: require('./auth.security.answer.html')
})

export class SecurityAnswerComponent {

	@Input questions = [];
	@Output answers = [];
	@Input num = 0;
	@Input view = 'answer';

	constructor(
		private router: Router,
		public EmitterService: EmitterService,
		public AuthStateService: AuthStateService,
		public API: AuthAPIService) {}

	ngOnInit() {
		var userId = AuthStateService.id('auth').get('userId');
		if (!userId) return;
		this.API.getSecurityQuestions(userId).subscribe(
			(response) => {
				response = response.data || response;
				this.questions[0] = response.security_q_1 || '';
				this.questions[1] = response.security_q_2 || '';
				var hasQuestions = !!this.questions[0] && !!this.questions[1];
				if (!hasQuestions) {
					this.view = 'errorNoQuestions';
				}
			},
			(error) => console.log(error)
		);
	}

	reset() {
		this.selectedQuestion = this.questions[0];
		this.num = 0;
		this.view = 'answer';
	}

	handleClick(model) {
	  if (this.num === 0) {
	    this.num += 1;
			model.reset();
	    return;
	  } else {
	    var userId = AuthStateService.id('auth').get('userId');
	    var payload = { security_a_1: this.answers[0], security_a_2: this.answers[1] };
	    this.API.checkSecurityQuestions(userId, payload).subscribe(
	      (response) => {
	        if (response.status === 'ACCOUNT_LOCKED') {
	          this.view = 'errorTooManyAttempts';
	        } else if (response.data === false) {
	          this.view = 'errorInvalidResponse';
	        } else {
	          AuthStateService.id('auth').set('securityAnswer1', this.answers[0]);
	          AuthStateService.id('auth').set('securityAnswer2', this.answers[1]);
	          this.router.navigate(['/auth/user/reset'], { queryParams: { security: true }});
	        }
	      },
	      (error) => {
	        this.view = 'errorTooManyAttempts';
	      }
	    );
	  }
	}

}
