import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { Filter, and, none, or, prop } from "@batch-flask/core";
import { AdvancedFilter } from "../advanced-filter";
import { AdvancedFilterControlBase } from "../control-base";

import "./list-filter-control.scss";

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
     * @default "|"
     */
    rangeSeparator?: string;
}

export interface ListFilterParsedValue {
    items: any[];
    ranges: any[][];
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

    public parseValue(value: string): ListFilterParsedValue {
        if (!value) {
            return { items: [], ranges: [] };
        }
        const values = this._parseInput(value);

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

    /**
     * This remove all whitespace in the input, split it by "," and then remove blank entries.
     * @param value Input to parseValue
     *
     * @example this._parseInput(" a, b,,   c,") //=> ["a", "b", "c"]
     */
    private _parseInput(value: string): string[] {
        return value.clearWhitespace().split(",").filter(x => x !== "");
    }

    /**
     * Parse a list of string into a list of numbers.
     * This ignore all strings not being valid numbers
     */
    private _parseNumbers(list: string[]): number[] {
        return list.map(x => Number(x)).filter(x => !isNaN(x));
    }

    /**
     * Parse the ranges to return a range of numbers
     * If either the start or the end of the range is not a valid number it will be ignored
     */
    private _parseRangeNumbers(ranges: string[][]): number[][] {
        return ranges.map((range) => {
            return this._parseNumbers(range);
        }).filter(x => x.length === 2);
    }

    /**
     * If allowRanges is enable extract the ranges from the list of values.
     * @returns object containing the items and the ranges.
     */
    private _extractRanges(values: string[]): ListFilterParsedValue {
        if (!this._config.allowRanges) {
            return { items: values, ranges: [] };
        }
        const items: string[] = [];
        const ranges: string[][] = [];
        for (const v of values) {
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
    selector: "bl-adv-filter-list",
    templateUrl: "list-filter-control.html",
})
export class AdvancedFilterListComponent {
    public ListFilterType = ListFilterType;

    @Input()
    public advancedFilter: AdvancedFilter;

    @Input()
    public control: ListFilterControl;
}
