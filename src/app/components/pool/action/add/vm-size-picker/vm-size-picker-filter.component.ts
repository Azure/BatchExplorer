import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { VmSizeFilterValue } from "app/models";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

export interface VmSizeFilterCategoryName {
    label: string;
    value: string;
}

@Component({
    selector: "bl-vm-size-picker-filter",
    templateUrl: "vm-size-picker-filter.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VmSizePickerFilterComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => VmSizePickerFilterComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmSizePickerFilterComponent implements ControlValueAccessor {
    @Input() public set categoriesDisplayName(names: any) {
        this._categoriesDisplayName = Object.keys(names).map((nameKey) => {
            return {
                label: names[nameKey],
                value: nameKey,
            };
        });
    }

    public get categoriesDisplayName() {
        return this._categoriesDisplayName;
    }
    public form: FormGroup;

    @Output() public filterChange = new EventEmitter<VmSizeFilterValue>();

    private _categoriesDisplayName: VmSizeFilterCategoryName[];
    private _propagateChange: (value: VmSizeFilterValue) => void = null;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            category: ["standard"],
            searchName: [],
        });

        this.form.valueChanges
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
            this.filterChange.emit(value);
        });
    }
    public writeValue(obj: VmSizeFilterValue): void {
        this.form.patchValue(obj);
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // Do nothing
    }

    public trackCategory(index, category: string) {
        return category;
    }
}
