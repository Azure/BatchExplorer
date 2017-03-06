import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import * as FilterBuilder from "app/utils/filter-builder";
import { AdvancedFilter } from "./advanced-filter";
import { AdvancedFilterControlBase } from "./control-base";

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

@Component({
    selector: "bl-adv-filter-statepicker",
    template: `
        <div [formGroup]="advancedFilter.group" *ngIf="advancedFilter && control">
            <fieldset formGroupName="{{control.name}}" >
                <h3>{{control.label}}</h3>
                <span *ngFor="let state of control.states" class="state-checkbox">
                    <md-checkbox color="primary" formControlName="{{state}}" name="{{state}}">
                        {{state}}
                    </md-checkbox>
                </span>
            </fieldset>
        </div>
    `,
})
export class AdvancedFilterStatePickerComponent {
    @Input()
    public advancedFilter: AdvancedFilter;

    @Input()
    public control: StatePickerControl;
}
