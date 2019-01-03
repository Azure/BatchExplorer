import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChildren, HostListener, Input, OnDestroy, QueryList, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ObjectUtils } from "@batch-flask/utils";
import { EditableTableColumnComponent, EditableTableColumnType } from "./editable-table-column.component";

import { ENTER } from "@batch-flask/core/keys";
import "./editable-table.scss";

@Component({
    selector: "bl-editable-table",
    templateUrl: "editable-table.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditableTableComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => EditableTableComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableTableComponent implements ControlValueAccessor, Validator, AfterContentInit, OnDestroy {
    @Input() public label: string;
    @Input() public hideCaption = false;

    @ContentChildren(EditableTableColumnComponent)
    public columns: QueryList<EditableTableColumnComponent>;
    public EditableTableColumnType = EditableTableColumnType;
    public items: FormArray;
    public form: FormGroup;

    private _propagateChange: (items: any[]) => void;
    private _sub: Subscription;
    private _writingValue = false;

    constructor(private formBuilder: FormBuilder, private changeDetector: ChangeDetectorRef) {
        this.items = formBuilder.array([]);
        this.form = formBuilder.group({ items: this.items });
        this._sub = this.items.valueChanges.subscribe((files) => {
            if (this._writingValue) { return; }
            const lastFile = files[files.length - 1];
            if (lastFile && !this._isEmpty(lastFile)) {
                this.addNewItem();
            }
            if (this._propagateChange) {
                this._propagateChange(this.items.value.slice(0, -1));
            }
        });
    }

    public ngAfterContentInit() {
        this._writingValue = true;
        this.addNewItem();
        this._writingValue = false;
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @HostListener("keypress", ["$event"])
    public handleKeydown(event: KeyboardEvent) {
        if (event.key === ENTER) {
            event.preventDefault();
        }
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
        this.changeDetector.markForCheck();
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
        this.changeDetector.markForCheck();
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
