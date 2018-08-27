'use strict';

import { Injectable, Inject } from '@angular/core';
import { APIBase } from './auth.api.base';
import { AuthHttp } from './auth.http.service';
import { MassageBootstrap } from './../../../core/process-bootstrap-service';

// https://docs.google.com/document/d/17gPB-3Qm3oUdNf1vs9l1ntLogF8d64Zu6mJVyh88wns/edit

@Injectable()
export class AuthAPIService extends APIBase {

	constructor(
		public http: AuthHttp,
		private massageBootstrap: MassageBootstrap
	) {
		super();
		this.prefix = this.getAll();
	}

	getCode(id) {
		// this.config here breaks due to CORS implementation (* + withCredentials not allowed)
		return this.http.get(`${this.prefix.order}regicode/${id}`, true);
	}

	checkCode(payload) {
		return this.http.put(`${this.prefix.base}user/creds/check`, payload);
	}

	resetStudentPasswordFromCode(payload) {
		return this.http.put(`${this.prefix.rest}users/password/reset/noauth`, payload);
	}

	addStudentToTrialCourse(payload) {
		return this.http.put(`${this.prefix.base}trial/course/5288/enroll`, payload);
	}

	getTrialCode(type) {
		var url = `${this.prefix.trial}registration/code`;
		if (type !== 'math') url += '/' + type;
		return this.http.get(url);
	}

	getTrialInfo() {
		return this.http.get(`${this.prefix.trial}username`);
	}

	getSecurityQuestions(userId) {
		return this.http.get(`${this.prefix.base}users/${userId}/questions`);
	}

	// requires auth
	setSecurityQuestions(payload) {
		return this.http.put(`${this.prefix.base}user/security/set/questions`, payload);
	}

	checkSecurityQuestions(userId, payload) {
		return this.http.put(`${this.prefix.base}users/${userId}/security/answers`, payload);
	}

	resetPasswordWithAnswers(userId, payload) {
		return this.http.put(`${this.prefix.base}users/${userId}/password/reset/answers`, payload);
	}

	resetPassword(payload) {
		return this.http.post(`${this.prefix.login}users/password/reset`, payload);
	}

	getDistrictInfoWithKey(payload) {
		return this.http.get(this.prefix.base + 'admin/district/key/:id');
	}

	getSchoolInfoById(id) {
		console.log('id: ', id);
		return this.http.get(this.prefix.base + 'schools/info/' + id);
	}

	getLicenseInfoById(id) {
		return this.http.get(this.prefix.base + 'admin/license/' + id);
	}

	login(payload) {
		return this.http.post(this.prefix.login + 'users/login', payload);
	}

	logout() {
		return this.http.post(this.prefix.login + 'users/logout');
	}

	userCreate(payload) {
		return this.http.post(this.prefix.login + 'users', payload);
	}

	userRegister(payload) {
		return this.http.post(this.prefix.login + 'users/register', payload);
	}

	userStatus() {
		return this.http.get(this.prefix.rest + 'users/status');
	}

	changePassword(payload) {
		return this.http.post(this.prefix.login + 'users/password', payload);
	}

	changePasswordWithToken(payload) {
		return this.http.post(this.prefix.login + 'users/password/token', payload);
	}

	userChangeEmail(payload) {
		return this.http.post(this.prefix.rest + 'users/email', payload);
	}

	setWrap(payload) {
		return this.http.put(this.prefix.base + 'output/wrapping/set', payload);
	}

	setCache(payload) {
		return this.http.put(this.prefix.base + 'output/caching/set', payload);
	}

	getAppState() {
		return this.http.get(this.prefix.base + 'bootstrap')
		.toPromise()
		.then(this.massageBootstrap.process);
	}

	getPrefs() {
		return this.http.get(this.prefix.base + 'prefs');
	}

	checkUsernameOrEmail(payload) {
		return this.http.put(this.prefix.base + 'users/username/check', payload);
	}

};
