import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { distinctUntilChanged } from "rxjs/operators";

export interface VmSizeFilterValue {
    category: string;
    searchName?: string;
}

@Component({
    selector: "bl-vm-size-picker-filter",
    templateUrl: "vm-size-picker-filter.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmSizePickerFilterComponent {
    @Input() public categoriesDisplayName: {[key: string]: string };
    @Output() public filterChange = new EventEmitter<VmSizeFilterValue>();
    public form: FormGroup;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            category: ["all"],
            searchName: [],
        });
        this.form.valueChanges.pipe(distinctUntilChanged())
            .subscribe((value) => {
                this.filterChange.emit(value);
            });
    }

    public trackByCategory(_, category: {key: string, value: string}) {
        return category.key;
    }
}
