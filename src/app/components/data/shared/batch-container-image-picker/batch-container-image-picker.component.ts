import { ChangeDetectionStrategy, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";

import "./batch-container-image-picker.scss";

@Component({
    selector: "bl-batch-container-image-picker",
    templateUrl: "batch-container-image-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BatchContainerImagePickerComponent), multi: true },
    ],
})

export class BatchContainerImagePickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    public value: FormControl<string>;
    public warning = false;

    constructor(
        private formBuilder: FormBuilder) {

        this.value = this.formBuilder.control([], null);
    }

    public ngOnDestroy() {
         // Do nothing
    }

    public writeValue(value: string) {
        this.value.setValue(value);
    }

    public registerOnChange(fn) {
         // Do nothing
    }

    public registerOnTouched() {
        // Do nothing
    }
}
