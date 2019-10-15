import { Component, HostBinding, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import * as FilterBuilder from "@batch-flask/core/filter-builder";
import { AdvancedFilter } from "../advanced-filter";
import { AdvancedFilterControlBase } from "../control-base";

import "./state-picker-control.scss";

export class StatePickerControl extends AdvancedFilterControlBase {
    constructor(label: string, public states: string[]) {
        super(label);
    }

    public formGroup(): FormGroup {
        const controls = this.states.reduce((map, state) => {
            map[state] = new FormControl(false);
            return map;
        }, {});
        return new FormGroup(controls);
    }

    public buildFilter(data: { [key: string]: boolean }): FilterBuilder.Filter {
        const filteredState = Object.keys(data).filter(x => data[x] === true);
        return FilterBuilder.prop(this.name).inList(filteredState);
    }
}

let idCounter = 0;

@Component({
    selector: "bl-adv-filter-statepicker",
    templateUrl: "state-picker-control.html",
})
export class AdvancedFilterStatePickerComponent {
    @Input() @HostBinding("attr.id") public id = `bl-adv-filter-statepicker-${idCounter++}`;
    @Input() public advancedFilter: AdvancedFilter;

    @Input() public control: StatePickerControl;

    public trackByFn(index, state: string) {
        return state;
    }
}
