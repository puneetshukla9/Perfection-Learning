'use strict';

import { Injectable } from '@angular/core';
import * as Validations from './auth.validation.service.json';

@Injectable()
export class ValidationService {

	constructor() {}

	get(key, type) {
		if (!key || !type) return false;
		var result;
		if (key !== 'text') {
			result = new RegExp(Validations[key][type]);
		} else {
			result = Validations[key][type];
		}
		return result;
	}

};
