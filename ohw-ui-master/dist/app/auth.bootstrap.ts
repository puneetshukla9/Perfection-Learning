// Angular 2

import 'es6-shim';
import 'reflect-metadata';
import 'rxjs/add/operator/map';
import 'zone.js';

// the old angular library is included here for the webpack ngTemplate loader
// even though we're blocking urls, it still tries to run and will throw an error
// if not included

var angular = require('angular');

import { NgModuleRef, enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './modules/auth/auth.module.ts';
import { UpgradeAdapter } from '@angular/upgrade';

if (window.location.hostname !== 'localhost') enableProdMode();

window.ohw = window.ohw || {};
window.ohw.originalRequest = window.location.pathname;

// platformBrowserDynamic().bootstrapModule(AppModule).then((ref: NgModuleRef) => ref.destroy());

export const moduleRef = platformBrowserDynamic().bootstrapModule(AppModule);
// .then((ref: NgModuleRef) => ref.destroy());
// moduleRef.destroy() should destroy angular2 app (returns promise)
