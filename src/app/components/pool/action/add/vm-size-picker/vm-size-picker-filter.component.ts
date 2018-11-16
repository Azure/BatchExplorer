import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from "@angular/core";
import { FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
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
export class VmSizePickerFilterComponent {
    @Input() public set categoriesDisplayName(names: any) {
        this._categoriesDisplayName = Object.keys(names).map((nameKey) => {
            return {
                label: names[nameKey],
                value: nameKey,
            } as VmSizeFilterCategoryName;
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
            category: ["all"],
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

    public trackCategory(index, category: string) {
        return category;
    }
}
