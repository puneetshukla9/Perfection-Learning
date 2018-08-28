import { OpaqueToken, APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthComponent } from './auth.component';
import { Routes, RouterModule } from '@angular/router';
import { SpinnerComponent } from './components/spinner/auth.spinner.component.ts';
import { Autofocus } from './directives/autofocus.directive.ts';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { routing, appRoutingProviders } from './auth.routes.ts';

import { MainComponent } from './components/main/auth.main.component';
import { CodeComponent } from './components/code/auth.code.component';
import { CreateTeacherComponent } from './components/create/auth.create.teacher.component';
import { CreateStudentComponent } from './components/create/auth.create.student.component';
import { ResetComponent } from './components/reset/auth.reset.component';
import { CodeConfirmComponent } from './components/code/auth.code.confirm.component';
import { SecurityCreateComponent } from './components/security/auth.security.create.component';
import { SecurityAnswerComponent } from './components/security/auth.security.answer.component';
import { UsernameComponent } from './components/username/auth.username.component';
import { EmailComponent } from './components/email/auth.email.component.ts';
import { PasswordComponent } from './components/password/auth.password.component.ts';
import { CompletedComponent } from './components/completed/auth.completed.component.ts';
import { TrialComponent } from './components/trial/auth.trial.component.ts';

import { EmitterService } from './services/auth.emitter.ts';
import { AuthAPIService } from './services/auth.api.ts';
import { AuthHttp } from './services/auth.http.service.ts';
import { AuthStateService } from './services/auth.state.service.ts';
import { ValidationService } from './services/auth.validation.service.ts';
import { MassageBootstrap } from './../../core/process-bootstrap-service.ts';
import { ConfigService } from './services/auth.config.service.ts';

// import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const API: OpaqueToken = new OpaqueToken('API');

const providers = [
    appRoutingProviders,
    EmitterService, // not working (get is not available)
    AuthHttp,
    AuthAPIService,
    AuthStateService,
    ConfigService,
    MassageBootstrap,
    ValidationService
];

@NgModule({
    imports: [FormsModule, HttpModule, BrowserModule, routing],
    declarations: [
      AuthComponent,
      MainComponent,
      SpinnerComponent,
      Autofocus,
      PasswordComponent,
      CodeComponent,
      CreateTeacherComponent,
      CreateStudentComponent,
      ResetComponent,
      CodeConfirmComponent,
      SecurityAnswerComponent,
      SecurityCreateComponent,
      UsernameComponent,
      EmailComponent,
      CompletedComponent,
      TrialComponent
    ],
    providers: providers,
    bootstrap: [AuthComponent]
})
export class AppModule {};
export const providers = providers;
