import { ElementRef, Directive } from '@angular/core';

@Directive({
		selector: '[coreAutofocus]'
})

export class Autofocus {

		constructor(public el: ElementRef) {}

		ngOnInit() {
			setTimeout(() => this.el.nativeElement.focus(), 100);
		}

};
