'use strict';

import { ChangeDetectorRef, Component, Input, ElementRef } from '@angular/core';
import { EmitterService } from './../../services/auth.emitter.ts';

@Component({
	styleUrl: require('./auth.spinner.less'),
	selector: 'spinner',
	providers: [EmitterService],
	templateUrl: require('./auth.spinner.html')
})

export class SpinnerComponent {

		@Input visible: Boolean = false;
		numLoadings = 0;

		constructor(
			public el: ElementRef,
			public EmitterService: EmitterService,
			private changeDetectionRef: ChangeDetectorRef) {}

		ngAfterViewInit() {
			EmitterService.get('spinner').subscribe(
				(value) => {
					if (value === true) {
						this.numLoadings++;
						this.visible = true;
					} else if (value === false) {
						this.numLoadings--;
						if (this.numLoadings <= 0) this.visible = false;
						// https://github.com/angular/angular/issues/6005
					}
					if (window.location.hostname === 'localhost') this.changeDetectionRef.detectChanges();
				}
			);
		}

};
