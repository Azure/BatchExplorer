import { Component, ContentChildren, QueryList, forwardRef } from "@angular/core";
import { FormArray, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";

import { EditableTableColumnComponent } from "./editable-table-column.component";

import "./editable-table.scss";

@Component({
    selector: "bl-editable-table",
    templateUrl: "editable-table.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditableTableColumnComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => EditableTableColumnComponent), multi: true },
    ],
})
export class EditableTableComponent {
    @ContentChildren(EditableTableColumnComponent)
    public columns: QueryList<EditableTableColumnComponent>;

    public items: FormArray;

    private _propagateChange: (items: any[]) => void;

    constructor(private formBuilder: FormBuilder) {
        this.items = formBuilder.array([]);
    }

    public addNewItem() {
        const columns = this.columns.toArray();
        const obj = {};
        for (let column of columns) {
            obj[column.name] = "";
        }
        this.items.push(this.formBuilder.group(obj));
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
    }

    public writeValue(value: any[]) {
        if (value) {
            this.items.controls = value.map((file) => {
                return this.formBuilder.group(file);
            });
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }
}
