import { AfterViewInit, Directive, ElementRef, Input } from "@angular/core";

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: "[autofocus]",
})
export class AutoFocusDirective implements AfterViewInit {
    private focus = true;

    constructor(private el: ElementRef) {
    }

    public ngAfterViewInit() {
        if (this.focus) {
            this.el.nativeElement.focus();
        }
    }

    @Input() set autofocus(condition: boolean) {
        this.focus = condition !== false;
    }
}
