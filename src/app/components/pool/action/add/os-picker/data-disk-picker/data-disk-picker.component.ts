import { ChangeDetectionStrategy, Component, forwardRef } from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { CachingType, StorageAccountType } from "app/models";
import { DataDiskDto } from "app/models/dtos/virtual-machine-configuration.dto";

@Component({
    selector: "bl-data-disk-picker",
    templateUrl: "data-disk-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DataDiskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => DataDiskPickerComponent), multi: true },
    ],
})
export class DataDiskPickerComponent implements ControlValueAccessor, Validator {
    public storageAccountTypes = Object.values(StorageAccountType);
    public cachingOptions = Object.values(CachingType);

    public disks = new FormControl<Array<Partial<AttrOf<DataDiskDto>>>>();
    private _changeCallback: (disks: DataDiskDto[]) => void;
    private _touchedCallback: () => void;

    constructor() {
        this.disks.valueChanges.subscribe((disks) => {
            if (this.disks.touched) {
                this._touchedCallback();
            }
            this._propagateChanges(disks.map(x => new DataDiskDto(x)));
        });
    }

    public writeValue(disks: DataDiskDto[]): void {
        if (disks) {
            this.disks.setValue(disks.map(x => x.toJS()));
        } else {
            this.disks.setValue([]);
        }
    }

    public registerOnChange(fn: (disks: DataDiskDto[]) => void): void {
        this._changeCallback = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this._touchedCallback = fn;
    }

    public validate(c: AbstractControl): ValidationErrors | null {
        return null;
    }

    private _propagateChanges(value: DataDiskDto[]) {
        if (this._changeCallback) {
            this._changeCallback(value);
        }
    }
}
