import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Output } from "@angular/core";

@Component({
    selector: "bl-focus-section",
    template: `
        <ng-content></ng-content>
    `,
})
export class FocusSectionComponent {
    @Output()
    public keypress = new EventEmitter<KeyboardEvent>();

    @Output()
    public onBlur = new EventEmitter<Event>();

    @Output()
    public onFocus = new EventEmitter<FocusEvent>();

    @HostBinding("attr.tabindex") public get tabindex() { return 0; }

    constructor(private elementRef: ElementRef) {
    }

    public focus() {
        this.onFocus.emit();
        this.elementRef.nativeElement.focus();
    }

    @HostListener("window:keydown", ["$event"])
    public keyboardInput(event: KeyboardEvent) {
        if (this.elementRef.nativeElement === document.activeElement) {
            this.keypress.emit(event);
        }
    }

    @HostListener("focus", ["$event"])
    public handleFocus(event: FocusEvent) {
        this.onFocus.emit(event);
    }

    @HostListener("blur", ["$event"])
    public handleBlur(event: Event) {
        this.onBlur.emit(event);
    }
}
