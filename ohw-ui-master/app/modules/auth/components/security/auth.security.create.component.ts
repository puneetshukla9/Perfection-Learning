'use strict';

import { Input, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter';
import { AuthStateService } from './../../services/auth.state.service';
import { AuthAPIService } from './../../services/auth.api';
import { Router } from '@angular/router';

const VALID_QUESTIONS = ['Who is your favorite teacher?', 'How many family members do you have?', 'What is your favorite food?'];

@Component({
	selector: 'security-create',
	providers: [AuthAPIService, AuthStateService, EmitterService],
	templateUrl: require('./auth.security.create.html')
})
export class SecurityCreateComponent {

	selectedQuestions: [] = [];

	@Input questions = VALID_QUESTIONS;
	@Input answers = [];
	@Input num = 0;
	@Input selectedQuestion = '';

	constructor(
		private router: Router,
		public EmitterService: EmitterService,
		public AuthStateService: AuthStateService,
		public API: AuthAPIService) {}

	ngOnInit() {
		this.selectedQuestion = this.questions[0];
		var userId = AuthStateService.id('auth').get('userId');
		if (!userId) return;
		this.API.getSecurityQuestions(userId).subscribe(
			(response) => {
				this.questions[0] = this.questions[0] || response.security_q_1;
				this.questions[1] = this.questions[1] || response.security_q_2;
				this.selectedQuestion = this.questions[0];
			},
			(error) => console.log(error)
		);
	}

	selectQuestion(question) {
		this.selectedQuestion = question;
	}

	handleClick(model) {
		this.selectedQuestions.push(this.selectedQuestion);
		var questionIndex = _.indexOf(this.questions, this.selectedQuestion);
		this.questions.splice(questionIndex, 1);
		this.selectedQuestion = this.questions[0];

		if (this.num === 0) {
			this.num += 1;
			model.reset();
			return false;
		}

		this.selectedQuestion = '';

		var userId = AuthStateService.id('auth').get('userId');
		var payload = {
			security_q_1: this.selectedQuestions[0],
			security_a_1: this.answers[0],
			security_q_2: this.selectedQuestions[1],
			security_a_2: this.answers[1]
		};

		this.API.setSecurityQuestions(payload).subscribe(
			(response) => {
				this.router.navigate(['/auth/user/complete']);
			},
			(error) => console.log(error)
		);

	}

}
