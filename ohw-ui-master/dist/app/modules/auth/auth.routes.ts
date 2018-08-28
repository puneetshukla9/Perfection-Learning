import { AuthComponent } from './auth.component';
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

export const AuthRoutes = [
	{ path: 'auth', abstract: true, children: [
		{ path: 'login/password', component: PasswordComponent },
		{ path: 'trial', component: TrialComponent },
		{ path: 'trial/:module', component: TrialComponent },
		{ path: 'main', component: MainComponent },
		{ path: 'code', component: CodeComponent },
		{ path: 'code/confirm', component: CodeConfirmComponent },
		{ path: 'user/username', component: UsernameComponent },
		{ path: 'user/email', component: EmailComponent },
		{ path: 'user/create-teacher', component: CreateTeacherComponent },
		{ path: 'user/create-student', component: CreateStudentComponent },
		{ path: 'user/reset', component: ResetComponent },
		{ path: 'user/security/create', component: SecurityCreateComponent },
		{ path: 'user/security', component: SecurityAnswerComponent },
		{ path: 'user/complete', component: CompletedComponent }]
	},
	{ path: '', redirectTo: '/auth/main', pathMatch: 'full' },
  { path: '**', component: MainComponent } // not found
];

import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(AuthRoutes);
