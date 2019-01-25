import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChildren, HostListener, Input, OnDestroy, QueryList, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { Subscription } from "rxjs";
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

    constructor(private formBuilder: FormBuilder, private changeDetector: ChangeDetectorRef) {
        this.items = formBuilder.array([]);
        this.form = formBuilder.group({ items: this.items });
        this._sub = this.items.valueChanges.subscribe((files) => {
            const lastFile = this.items.controls[files.length - 1];
            if (lastFile.dirty) {
                this.addNewItem();
            }
            this._notifyChanges();
        });
    }

    public ngAfterContentInit() {
        console.log("Content init?");
        this.addNewItem();
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
        const last = this.items.controls.last();
        if (last && last.pristine) {
            return;
        }
        this.items.push(this._createEmptyRow());
        this.changeDetector.markForCheck();
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
        this.changeDetector.markForCheck();
    }

    public writeValue(value: any[]) {
        console.log("Write value?", value);
        if (!this.columns) { return; }
        const controls: FormGroup[] = [];

        if (Array.isArray(value) && value.length > 0) {
            for (const val of value) {
                controls.push(this.formBuilder.group(val));
            }
        }
        controls.push(this._createEmptyRow());
        this.items.controls = controls;
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

    private _createEmptyRow(): FormGroup {
        const columns = this.columns.toArray();
        const obj = {};
        for (const column of columns) {
            obj[column.name] = column.default;
        }
        return this.formBuilder.group(obj);
    }

    private _notifyChanges() {
        if (this._propagateChange) {
            this._propagateChange(this._processValues());
        }
    }
    private _processValues() {
        const values = this.items.value.slice(0, -1);
        const columns = this.columns.toArray();

        return values.map((row) => {
            const obj = {};
            for (const column of columns) {
                if (column.type === EditableTableColumnType.Number) {
                    obj[column.name] = parseInt(row[column.name], 10);
                } else {
                    obj[column.name] = row[column.name];
                }
            }
            return obj;
        });
    }
}
