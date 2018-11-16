import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from "@angular/core";
import { FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { distinctUntilChanged } from "rxjs/operators";

export interface VmSizeFilterValue {
    category: string;
    searchName?: string;
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
    @Input() public categoriesDisplayName: {[key: string]: string };
    @Output() public filterChange = new EventEmitter<VmSizeFilterValue>();
    public form: FormGroup;

    private _propagateChange: (value: VmSizeFilterValue) => void = null;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            category: ["all"],
            searchName: [],
        });
        this.form.valueChanges.pipe(distinctUntilChanged())
            .subscribe((value) => {
                if (this._propagateChange) {
                    this._propagateChange(value);
                }
                this.filterChange.emit(value);
            });
    }

    public trackByCategory(_, category: {key: string, value: string}) {
        return category.key;
    }
}
