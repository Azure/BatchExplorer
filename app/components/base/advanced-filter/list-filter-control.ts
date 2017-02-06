import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { Filter, and, none, or, prop } from "app/utils/filter-builder";
import { AdvancedFilter } from "./advanced-filter";
import { AdvancedFilterControlBase } from "./control-base";

export enum ListFilterType {
    Include,
    Exclude,
}

export interface ListFilterControlConfig {
    /**
     * If set to true all entries will be converted to numbers or ignored.
     */
    number?: boolean;

    /**
     * Allow list to take range.
     * Range need to be speparated by the rangeSeparator
     */
    allowRanges?: boolean;

    /**
     * @default "-"
     */
    rangeSeparator?: string;
}

export class ListFilterControl extends AdvancedFilterControlBase {
    private _valueControl = new FormControl("");

    constructor(label: string, private _config: ListFilterControlConfig = {}) {
        super(label);
        if (!this._config.rangeSeparator) {
            this._config.rangeSeparator = "|";
        }
    }

    public formGroup(): FormGroup {
        return new FormGroup({
            type: new FormControl(ListFilterType.Include),
            value: this._valueControl,
        });
    }

    public buildFilter(data: { value: string, type: ListFilterType }): Filter {
        if (!data.value) {
            return none();
        }
        const values = this.parseValue(data.value);
        if (data.type === ListFilterType.Include) {
            const ranges = values.ranges.map(x => {
                return and(prop(this.name).ge(x[0]), prop(this.name).le(x[1]));
            });
            return or(...ranges, prop(this.name).inList(values.items));
        } else {
            const ranges = values.ranges.map(x => {
                return or(prop(this.name).lt(x[0]), prop(this.name).gt(x[1]));
            });
            return and(...ranges, prop(this.name).notInList(values.items));
        }
    }

    public parseValue(value: string): { items: any[], ranges: any[][] } {
        if (!value) {
            return { items: [], ranges: [] };
        }
        let values = value.replace(/\s/g, "").split(",").filter(x => x !== "");

        let {items, ranges} = this._extractRanges(values) as any;

        if (this._config.number) {
            items = this._parseNumbers(items);
            ranges = this._parseRangeNumbers(ranges);
        }
        return {
            items,
            ranges,
        };
    }

    private _parseNumbers(list: string[]): number[] {
        return list.map(x => Number(x)).filter(x => !isNaN(x));
    }

    private _parseRangeNumbers(ranges: string[][]): number[][] {
        return ranges.map((range) => {
            return this._parseNumbers(range);
        }).filter(x => x.length === 2);
    }

    private _extractRanges(values: string[]) {
        if (!this._config.allowRanges) {
            return { items: values, ranges: [] };
        }
        const items: string[] = [];
        const ranges: string[][] = [];
        for (let v of values) {
            const range = v.split(this._config.rangeSeparator, 2).filter(x => x !== "");
            if (range.length === 1) {
                items.push(v);
            } else {
                ranges.push(range);
            }
        }

        return {
            items,
            ranges,
        };
    }
}

@Component({
    selector: "bex-adv-filter-list",
    template: `
        <div [formGroup]="advancedFilter.group" *ngIf="advancedFilter && control">
            <h3>{{control.label}}</h3>
            <fieldset formGroupName="{{control.name}}" >
                <md-input-container class="value">
                    <input md-input formControlName="value" placeholder="Values comma speparated(1,54432,-2,100|200)"/>
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
