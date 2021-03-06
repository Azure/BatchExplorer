import { Component, ElementRef, HostBinding, Input, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import "./expanding-textarea.scss";

@Component({
    selector: "bl-expanding-textarea",
    templateUrl: "expanding-textarea.html",
    providers: [
        // eslint-disable-next-line @angular-eslint/no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ExpandingTextareaComponent), multi: true },
    ],
})
export class ExpandingTextareaComponent implements ControlValueAccessor {
    @Input() public placeholder: string;
    @Input() public value: string;
    @Input() public hint: string;

    @HostBinding("class.expanded") public expanded: boolean = false;
    @ViewChild("textarea", { static: false }) public textarea: ElementRef;

    private _propagateChange: any;
    private _propagateTouched: any;
    private _lastExpandedHeight = "100px";

    public expand() {
        this.expanded = true;
        this.textarea.nativeElement.style.height = this._lastExpandedHeight;
        if (this._propagateTouched) {
            this._propagateTouched(true);
        }
    }

    public collapse() {
        this._lastExpandedHeight = this.textarea.nativeElement.style.height;
        this.textarea.nativeElement.style.height = null;
        this.expanded = false;
    }

    public valueChange(newValue: string) {
        this.value = newValue;
        if (this._propagateChange) {
            this._propagateChange(newValue);
        }
    }

    public writeValue(value: string): void {
        this.value = value;
    }
    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this._propagateTouched = fn;
    }
}
