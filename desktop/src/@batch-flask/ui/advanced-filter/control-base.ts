import { FormGroup } from "@angular/forms";
import { Filter } from "@batch-flask/core";
import { AdvancedFilter } from "./advanced-filter";

export abstract class AdvancedFilterControlBase {
    public name: string;
    public advancedFilter: AdvancedFilter;

    constructor(public label: string) { }

    public abstract formGroup(): FormGroup;
    public abstract buildFilter(data: any): Filter;
}
