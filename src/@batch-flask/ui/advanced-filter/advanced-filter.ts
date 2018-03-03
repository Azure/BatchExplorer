import { FormGroup } from "@angular/forms";
import { Map } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import * as FilterBuilder from "@batch-flask/core/filter-builder";
import { log } from "@batch-flask/utils";
import { AdvancedFilterControlBase } from "./control-base";

export class AdvancedFilter {
    public group: FormGroup;
    public filterChange: Observable<FilterBuilder.Filter>;

    private _filterChange = new BehaviorSubject<FilterBuilder.Filter>(FilterBuilder.none());

    constructor(public controls: { [key: string]: AdvancedFilterControlBase }) {
        this.filterChange = this._filterChange.asObservable();

        for (const name of Object.keys(controls)) {
            controls[name].name = name;
            controls[name].advancedFilter = this;
        }
        this.controls = controls;

        this.group = this._buildFormGroup();

        this.group.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((data) => {
            this._handleFormChange(data);
        });
    }

    private _buildFormGroup(): FormGroup {
        const controls = Map(this.controls).map((value) => {
            return value.formGroup();
        }).toObject();
        return new FormGroup(controls);
    }

    private _handleFormChange(data: any) {
        const controls = this.controls;
        const filters: FilterBuilder.Filter[] = [];
        for (const key of Object.keys(data)) {
            const control = controls[key];
            if (!control) {
                log.error(`Error advanced filter has unknown output key '${key}'`, [data, controls]);
            }

            filters.push(control.buildFilter(data[key]));
        }

        this._filterChange.next(FilterBuilder.and(...filters));
    }
}
