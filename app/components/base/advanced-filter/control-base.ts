import { FormGroup } from "@angular/forms";

import { AdvancedFilter } from "./advanced-filter";
import { Filter } from "app/utils/filter-builder";

export abstract class AdvancedFilterControlBase {
    public name: string;
    public advancedFilter: AdvancedFilter;

    constructor(public label: string) { }

    public abstract formGroup(): FormGroup;
    public abstract buildFilter(data: any): Filter;
}
