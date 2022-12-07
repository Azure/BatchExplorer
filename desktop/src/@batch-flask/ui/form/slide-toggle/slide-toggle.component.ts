import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import "./slide-toggle.scss";
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
    selector: "be-slide-toggle",
    templateUrl: "./slide-toggle.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SlideToggleComponent),
        multi: true
    }]
})
export class SlideToggleComponent implements ControlValueAccessor {
    @Input() public checked: boolean;
    @Input() public isDisabled: boolean = false;
    @Output() public toggleChange = new EventEmitter<boolean>();

    private onChange = (_: boolean) => { /* void */ };

    writeValue(value: boolean): void {
        this.checked = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched() {
        // Do nothing
    }

    public valueChange(value: boolean) {
        this.checked = value;
        this.onChange(value);
    }

    public onToggleChange(event: MatSlideToggleChange): void {
        this.writeValue(event.checked);
        this.toggleChange.emit(event.checked);
    }
}
