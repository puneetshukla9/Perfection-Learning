'use strict';

import { Injectable } from '@angular/core';

class StateService {

	private data: WeakMap;

	constructor() {
		this.data = new WeakMap();
	}

	set(key, value) {
		this.data[key] = value;
		return this.data[key];
	}

	get(key) {
		return this.data[key];
	}

	clear(key) {
		this.data[key] = null;
		return this.data[key];
	}

	refresh() {
		this.data = null;
		this.data = new WeakMap();
	}

};

@Injectable()
export class AuthStateService {

  private static _stateServices: { [ID: string]: StateService<any> } = {};

	static id(ID: string): StateService<any> {
		if (!this._stateServices[ID]) this._stateServices[ID] = new StateService();
		return this._stateServices[ID];
	}

};
