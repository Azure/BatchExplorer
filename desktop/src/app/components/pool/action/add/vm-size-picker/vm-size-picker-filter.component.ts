import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { distinctUntilChanged } from "rxjs/operators";

export interface VmSizeFilterValue {
    category: string;
    searchName?: string;
}

@Component({
    standalone: false,
    selector: "bl-vm-size-picker-filter",
    templateUrl: "vm-size-picker-filter.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmSizePickerFilterComponent {
    @Input() public categoriesDisplayName: {[key: string]: string };
    @Output() public filterChange = new EventEmitter<VmSizeFilterValue>();
    public form: UntypedFormGroup;

    constructor(formBuilder: UntypedFormBuilder) {
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
