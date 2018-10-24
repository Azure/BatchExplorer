import { Directive, ElementRef, Input, OnInit } from "@angular/core";

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: "[autofocus]",
})
export class AutoFocusDirective implements OnInit {
    private focus = true;

    constructor(private el: ElementRef) {
    }

    public ngOnInit() {
        if (this.focus) {
            // Otherwise Angular throws error: Expression has changed after it was checked.
            window.setTimeout(() => {
                this.el.nativeElement.focus();
            });
        }
    }

    @Input() set autofocus(condition: boolean) {
        this.focus = condition !== false;
    }
}
