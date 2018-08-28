'use strict';

import { Input, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthStateService } from './../../services/auth.state.service.ts';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AuthAPIService } from './../../services/auth.api.ts';
import { Router } from '@angular/router';

@Component({
	selector: 'main',
	templateUrl: require('./auth.main.html')
})

export class MainComponent {

	@Input() logo = require('./../../../../assets/images/pl-logo.svg');

	constructor(
		private DomSanitizer: DomSanitizer,
		public API: AuthAPIService,
		private router: Router
	) {}

	ngOnInit() {
		// clear out query string
		//AuthStateService.id('auth').refresh();

	}

	

}
