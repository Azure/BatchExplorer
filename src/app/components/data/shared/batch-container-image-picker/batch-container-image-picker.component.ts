import { ChangeDetectionStrategy, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";

import { BatchContainerImageService } from "app/services";
import { List } from "immutable";
import "./batch-container-image-picker.scss";

@Component({
    selector: "bl-batch-container-image-picker",
    templateUrl: "batch-container-image-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BatchContainerImagePickerComponent), multi: true },
        BatchContainerImageService,
    ],
})

export class BatchContainerImagePickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    public pickedImage: FormControl<string>;
    public images: List<string> = List([]);
    public warning = false;

    constructor(
        private batchContainerImageService: BatchContainerImageService,
        private formBuilder: FormBuilder) {

        this.pickedImage = this.formBuilder.control([], null);
    }

    public ngOnInit() {
        this.batchContainerImageService.getImages().subscribe((images) => {
            this.images = images;
        });
    }

    public trackImage(_, image: string) {
        return this.pickedImage.value;
    }

    public ngOnDestroy() {
         // Do nothing
    }

    public writeValue(value: string) {
        this.pickedImage.setValue(value);
    }

    public registerOnChange(fn) {
         // Do nothing
    }

    public registerOnTouched() {
        // Do nothing
    }
}
