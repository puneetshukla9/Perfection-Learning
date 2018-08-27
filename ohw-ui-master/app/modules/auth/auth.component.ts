'use strict';

import { Input, Component, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EmitterService } from './services/auth.emitter.ts';
import { AuthAPIService } from './services/auth.api.ts';
import { ConfigService } from './services/auth.config.service.ts';
import { AuthHttp } from './services/auth.http.service.ts';
import { AuthStateService } from './services/auth.state.service';
import { SpinnerComponent } from './components/spinner/auth.spinner.component.ts';
import { AppModule } from './auth.module.ts';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';

// providers below reflect component wide sharing
@Component({
	selector: 'auth',
	styleUrl: require('./auth.less'),
	templateUrl: require('./auth.container.html')
})

export class AuthComponent {

//	@Input() logo = require('./../../assets/images/header-logo-mathx.svg');
	@Input() logo = require('./../../assets/images/pl-logo.svg');

	@Input() page = 'one';
	@Input() invisible = false;
	@Input() loaded = false;

	constructor(
		private OHW: ConfigService,
		private API: AuthAPIService,
		private AuthStateService: AuthStateService,
		private DomSanitizer: DomSanitizer,
		private router: Router
	) {
		this.listener = EmitterService.get('login').subscribe(value => {
			this.invisible = value;
		});

	}

	ngOnDestroy() {
		this.listener.unsubscribe();
	}

	ngOnInit() {

		// check for referrer === 'test-engage.perfectionlearning.com'
		if (/engage.perfectionlearning.com/.test(document.referrer)) {
			AuthStateService.id('auth').set('from-redirect', 'engage');
		}
		if (window.location.search.indexOf('autologout=false') >= 0) {
			AuthStateService.id('auth').set('autologout', false);
		}

		//pass logout as param to force logout
		if (window.location.search.indexOf('logout=true') >= 0) {
			this.forceLogout();
		} else {
			this.API.setWrap({ wrap_output: true }).subscribe(
				() => {
						this.checkLogin();
				});
		}



	}

	checkLogin() {
		// if already logged in, forward along

		this.API.userStatus().subscribe(
			(response) => { // handle wrapped version
				if (_.has(response, 'data') && response.data.Code === 'NOT_LOGGED_IN') {
					this.loaded = true; // prevents flicker during re-route through to OHW
					return;
				} else {
					let trialCookie = Cookie.get('hadTrial');
					if (trialCookie === 'true') {
						Cookie.deleteAll();
						this.listener.unsubscribe();
						this.API.logout().subscribe(
							(response) => {
								AuthStateService.id('auth').set('username', '');
								this.router.navigate(['/auth/main']);
								this.invisible = false;
								this.loaded = true;
							}
						);

					} else {
						this.OHW.load();
					}
				}
			},
			(error) => {
				if (error.status === 403) {
					// we're right where we need to be
					return;
				} else {
					window.location.href = '//www.microsoft.com';
				}
			}
		);
	}


	forceLogout() {
		this.API.logout().subscribe(
			(response) => {
				AuthStateService.id('auth').set('username', '');
				this.router.navigate(['/auth/main']);
				this.invisible = false;
				this.loaded = true;
			}
		);
	}

	handleClick() {
		this.page = this.page === 'one' ? 'two' : 'one';
	}
}
