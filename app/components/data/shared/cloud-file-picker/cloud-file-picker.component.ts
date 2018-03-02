import { Component, Input, OnChanges, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { autobind } from "@bl-common/core";
import { Subscription } from "rxjs";

import { DialogService } from "@bl-common/ui/dialogs";
import { StorageService } from "app/services";
import { CloudFilePickerDialogComponent } from "./cloud-file-picker-dialog.component";
import "./cloud-file-picker.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-cloud-file-picker",
    templateUrl: "cloud-file-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CloudFilePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CloudFilePickerComponent), multi: true },
    ],
})
export class CloudFilePickerComponent implements ControlValueAccessor, OnChanges, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    /**
     * Name of the file group from which to pick a file.
     */
    @Input() public containerId: string;

    public value = new FormControl();
    public warning = false;

    private _propagateChange: (value: any[]) => void = null;
    private _subscriptions: Subscription[] = [];

    constructor(private storageService: StorageService, private dialog: DialogService) {
        this._subscriptions.push(this.value.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            this._checkValid(value);
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        }));
    }

    public ngOnChanges(changes) {
        if (changes.containerId) {
            // check validity if the selected file group changes
            this._checkValid(this.value.value);
        }
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
    }

    public writeValue(value: string) {
        this.value.setValue(value);
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        this.value.markAsTouched();
    }

    public validate(c: FormControl) {
        return null;
    }

    @autobind()
    public openFilePickerDialog() {
        const ref = this.dialog.open(CloudFilePickerDialogComponent);
        const component = ref.componentInstance;
        component.containerId = this.containerId;
        component.pickedFile = this.value.value;
        component.done.subscribe((save) => {
            if (save) {
                this.value.setValue(component.pickedFile);
            }
        });

        return component.done;
    }

    private _checkValid(value: string) {
        if (!value) {
            this.warning = false;
            return;
        }

        // validate that the blob exists in the selected container
        // note: value includes prefix
        this.storageService.getBlobPropertiesOnce(this.containerId, value).subscribe((blob) => {
            this.warning = false;
        }, (error) => {
            this.warning = true;
        });
    }
}
