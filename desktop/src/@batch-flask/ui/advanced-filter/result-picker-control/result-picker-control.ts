import { Component, HostBinding, Input } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import * as FilterBuilder from "@batch-flask/core/filter-builder";
import { AdvancedFilter } from "../advanced-filter";
import { AdvancedFilterControlBase } from "../control-base";

import "./result-picker-control.scss";

export class ResultPickerControl extends AdvancedFilterControlBase {
    constructor(label: string, public results: string[]) {
        super(label);
    }

    public formGroup(): UntypedFormGroup {
        const controls = this.results.reduce((map, result) => {
            map[result] = new UntypedFormControl(false);
            return map;
        }, {});
        return new UntypedFormGroup(controls);
    }

    public buildFilter(data: { [key: string]: boolean }): FilterBuilder.Filter {
        const filteredResult = Object.keys(data).filter(x => data[x] === true);
        return FilterBuilder.prop(this.name).inList(filteredResult);
    }
}

let idCounter = 0;

@Component({
    standalone: false,
    selector: "bl-adv-filter-resultpicker",
    templateUrl: "result-picker-control.html",
})
export class AdvancedFilterResultPickerComponent {
    @Input() @HostBinding("attr.id") public id = `bl-adv-filter-resultpicker-${idCounter++}`;
    @Input() public advancedFilter: AdvancedFilter;

    @Input() public control: ResultPickerControl;

    public trackByFn(index, result: string) {
        return result;
    }
}
