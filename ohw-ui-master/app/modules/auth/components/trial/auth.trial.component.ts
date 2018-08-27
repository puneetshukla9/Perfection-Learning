'use strict';

import { ChangeDetectorRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';
import { AuthAPIService } from './../../services/auth.api.ts';
import { AuthStateService } from './../../services/auth.state.service.ts';
import { AuthHttp } from './../../services/auth.http.service.ts';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
	selector: 'trial',
	providers: [EmitterService, AuthHttp, AuthStateService, AuthAPIService],
	templateUrl: require('./auth.trial.html')
})

export class TrialComponent {

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private router: Router,
		public EmitterService: EmitterService,
		public API: AuthAPIService) {
	}

	ngOnInit() {
		let url = this.router.routerState.snapshot.url;
		let trialRe = /trial(\/(\w+))?$/;
		let result = trialRe.exec(url);
		var trialType = result[2] ? result[2] : 'math';
		this.trialLogin(trialType);
	}

	trialLogin(type) {
		console.log('in trial login', type);
		this.API.setWrap({ wrap_output: true });
		var email, password, token, code;
		this.API.getTrialCode(type).subscribe(
			(response) => {
				code = response.data;
				Cookie.set('hadTrial', 'true');
				this.API.getTrialInfo().subscribe(
					(response) => {
						response = response.data;
						// student is usertype 1
						email = response.email;
						password = response.pw;
						AuthStateService.id('auth').set('email', email);
						AuthStateService.id('auth').set('password', password);
						var payload = {
							first: response.first_name,
							last: response.last_name,
							email: response.email,
							usertype: 1,
							pw: response.pw,
							token: code || '7837382543'
						};
						this.API.userCreate(payload).subscribe(
							(response) => {
								this.router.navigate(['/auth/user/complete'], { queryParams: { auto: true }});
							}, (err) => {
								this.router.navigate(['/auth/user/complete'], { queryParams: { auto: true }});
							}
						);
					}
				);
			}
		);
	}
}
