import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChildren, HostListener, Input, OnDestroy, QueryList, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { ENTER } from "@batch-flask/core/keys";
import { ReplaySubject, Subject, combineLatest } from "rxjs";
import { map, publishReplay, refCount, startWith, takeUntil } from "rxjs/operators";
import { EditableTableColumnComponent, EditableTableColumnType } from "./editable-table-column.component";

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
    public form: FormGroup;

    private _propagateChange: (items: any[]) => void;
    private _valueUpdated = new ReplaySubject<any[]>(1);
    private _destroy = new Subject();
    constructor(private formBuilder: FormBuilder, private changeDetector: ChangeDetectorRef) {
        this.form = formBuilder.group({ items: this.formBuilder.array([]) });
    }

    public ngAfterContentInit() {
        const columnObs = this.columns.changes.pipe(
            startWith(this.columns),
            map(x => x.toArray()),
            publishReplay(1),
            refCount(),
        );

        combineLatest(this._valueUpdated, columnObs).pipe(
            takeUntil(this._destroy),
        ).subscribe(([value, columns]) => {
            this._buildControlsFromValue(value, columns);
        });

        combineLatest(this.form.valueChanges, columnObs).pipe(
            takeUntil(this._destroy),
        ).subscribe(([formValue, columns]) => {
            const items = formValue.items;
            const lastRow = this.items.controls[items.length - 1];
            if (lastRow.dirty) {
                this.addNewItem(columns);
            }
            this._notifyChanges(items, columns);
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    @HostListener("keypress", ["$event"])
    public handleKeydown(event: KeyboardEvent) {
        if (event.key === ENTER) {
            event.preventDefault();
        }
    }

    public get items(): FormArray {
        return this.form.controls.items as FormArray;
    }

    public addNewItem(columns: EditableTableColumnComponent[]) {
        const last = this.items.controls.last();
        if (last && last.pristine) {
            return;
        }
        this.items.push(this._createEmptyRow(columns));
        this.changeDetector.markForCheck();
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
        this.changeDetector.markForCheck();
    }

    public writeValue(value: any[]) {
        this._valueUpdated.next(value || []);
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

    public trackColumn(_: number, column: EditableTableColumnComponent) {
        return column.name;
    }

    public trackRows(_: number, row: any) {
        return row;
    }

    private _buildControlsFromValue(value: any[], columns: EditableTableColumnComponent[]) {
        const controls: FormGroup[] = [];

        if (Array.isArray(value) && value.length > 0) {
            for (const val of value) {
                const obj = {};
                for (const column of columns) {
                    obj[column.name] = [val[column.name] || column.default];
                }
                controls.push(this.formBuilder.group(obj));
            }
        }
        controls.push(this._createEmptyRow(columns));
        this.form.setControl("items", new FormArray(controls));
        this.changeDetector.markForCheck();
    }

    private _createEmptyRow(columns: EditableTableColumnComponent[]): FormGroup {
        const obj = {};
        for (const column of columns) {
            obj[column.name] = [column.default];
        }
        return this.formBuilder.group(obj);
    }

    private _notifyChanges(values: any[], columns: EditableTableColumnComponent[]) {
        if (this._propagateChange) {
            this._propagateChange(this._processValues(values, columns));
        }
    }

    private _processValues(values: any[], columns: EditableTableColumnComponent[]) {
        values = values.slice(0, -1); // Remove last

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
