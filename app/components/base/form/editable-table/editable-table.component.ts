import {
    AfterViewInit, Component, ContentChildren, OnDestroy, QueryList, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ObjectUtils } from "app/utils";
import { EditableTableColumnComponent } from "./editable-table-column.component";

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

    public items: FormArray;
    public form: FormGroup;

    private _propagateChange: (items: any[]) => void;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.items = formBuilder.array([]);
        this.form = formBuilder.group({ items: this.items });
        this._sub = this.items.valueChanges.subscribe((files) => {
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
        if (!this.columns) {
            return;
        }
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

    public writeValue(values: any[]) {
        this.items.controls = [];

        if (values) {
            for (let file of values) {
                this.items.push(this.formBuilder.group(file));
            }
        }
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

    private _isEmpty(obj: any) {
        for (let value of ObjectUtils.values(obj)) {
            if (value) {
                return false;
            }
        }
        return true;
    }
}
