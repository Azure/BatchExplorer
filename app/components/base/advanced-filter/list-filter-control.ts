import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import * as FilterBuilder from "app/utils/filter-builder";
import { AdvancedFilter } from "./advanced-filter";
import { AdvancedFilterControlBase } from "./control-base";

export enum ListFilterType {
    Include,
    Exclude,
}

export class ListFilterControl extends AdvancedFilterControlBase {
    private _valueControl = new FormControl("");

    constructor(label: string, private _expectNumber = false) {
        super(label);
    }

    public formGroup(): FormGroup {
        return new FormGroup({
            type: new FormControl(ListFilterType.Include),
            value: this._valueControl,
        });
    }

    public buildFilter(data: { value: string, type: ListFilterType }): FilterBuilder.Filter {
        if (!data.value) {
            return FilterBuilder.none();
        }
        const values = this.parseValue(data.value);
        if (data.type === ListFilterType.Include) {
            return FilterBuilder.prop(this.name).inList(values);
        } else {
            return FilterBuilder.prop(this.name).notInList(values);
        }
    }

    public parseValue(value: string): any[] {
        if (!value) {
            return [];
        }
        let values = value.replace(/\s/g, "").split(",").filter(x => x !== "");
        if (this._expectNumber) {
            return values.map(x => Number(x)).filter(x => !isNaN(x));
        }
        return values;
    }
}

@Component({
    selector: "bex-adv-filter-list",
    template: `
        <div [formGroup]="advancedFilter.group" *ngIf="advancedFilter && control">
            <h3>{{control.label}}</h3>
            <fieldset formGroupName="{{control.name}}" >
                <md-input-container class="value">
                    <input md-input formControlName="value" placeholder="Values comma speparated(1,54432,-2)"/>
                </md-input-container>
                <md-radio-group formControlName="type" class="type">
                    <md-radio-button [value]="ListFilterType.Include">Include</md-radio-button>
                    <md-radio-button [value]="ListFilterType.Exclude">Exclude</md-radio-button>
                </md-radio-group>
            </fieldset>
        </div>
    `,
})
export class AdvancedFilterListComponent {
    public ListFilterType = ListFilterType;

    @Input()
    public advancedFilter: AdvancedFilter;

    @Input()
    public control: ListFilterControl;
}
