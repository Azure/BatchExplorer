import {
    AfterViewInit, Component, ContentChildren, OnDestroy, QueryList, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ObjectUtils } from "@batch-flask/utils";
import { EditableTableColumnComponent, EditableTableColumnType } from "./editable-table-column.component";

import "./editable-table.scss";

@Component({
    selector: "bl-editable-table",
    templateUrl: "editable-table.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditableTableComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => EditableTableComponent), multi: true },
    ],
})
export class EditableTableComponent implements ControlValueAccessor, Validator, AfterViewInit, OnDestroy {
    @ContentChildren(EditableTableColumnComponent)
    public columns: QueryList<EditableTableColumnComponent>;
    public EditableTableColumnType = EditableTableColumnType;
    public items: FormArray;
    public form: FormGroup;

    private _propagateChange: (items: any[]) => void;
    private _sub: Subscription;
    private _writingValue = false;

    constructor(private formBuilder: FormBuilder) {
        this.items = formBuilder.array([]);
        this.form = formBuilder.group({ items: this.items });
        this._sub = this.items.valueChanges.subscribe((files) => {
            if (this._writingValue) {
                return;
            }
            const lastFile = files[files.length - 1];
            if (lastFile && !this._isEmpty(lastFile)) {
                this.addNewItem();
            }
            if (this._propagateChange) {
                this._propagateChange(this.items.value.slice(0, -1));
            }
        });
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.addNewItem();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public addNewItem() {
        const last = this.items.value.last();
        if (last && this._isEmpty(last)) {
            return;
        }
        if (!this.columns) {
            return;
        }
        const columns = this.columns.toArray();
        const obj = {};
        for (const column of columns) {
            obj[column.name] = "";
        }
        this.items.push(this.formBuilder.group(obj));
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
    }

    public writeValue(value: any[]) {
        this._writingValue = true;
        this.items.controls = [];

        if (Array.isArray(value) && value.length > 0) {
            for (const val of value) {
                this.items.push(this.formBuilder.group(val));
            }
        } else {
            this.items.setValue([]);
        }
        this._writingValue = false;
        this.addNewItem();
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

    public trackColumn(index, column: EditableTableColumnComponent) {
        return column.name;
    }

    public trackRows(index, row: any) {
        return row;
    }

    private _isEmpty(obj: any) {
        for (const value of ObjectUtils.values(obj)) {
            if (value) {
                return false;
            }
        }
        return true;
    }
}
