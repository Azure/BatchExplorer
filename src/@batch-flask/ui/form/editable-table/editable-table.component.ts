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
            console.log("Form Value", formValue, this.form.controls);
            const items = formValue.items;
            const lastRow = this.items.controls[items.length - 1];
            if (lastRow.dirty) {
                this.addNewItem(columns);
                // Don't need to notify changes here as it will trigger this callback again when we add the new item.
                // Doing so actually erase the changes
            } else {
                this._notifyChanges(items, columns);
            }
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
        console.log("This", this.items.controls);
        this.items.removeAt(index);
        console.log("This2", this.items.controls);
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

    public trackRows(index: number) {
        return index;
    }

    private _buildControlsFromValue(items: any[], columns: EditableTableColumnComponent[]) {
        if (Array.isArray(items) && items.length > 0) {
            const controls: FormGroup[] = Object.values(this.items.controls).slice(0, items.length) as any;
            if (controls.length < items.length) {
                for (const _ of items.slice(controls.length)) {
                    controls.push(this._createEmptyRow(columns));
                }
                controls.push(this._createEmptyRow(columns));
            } else if (controls.length === items.length) {
                controls.push(this._createEmptyRow(columns));
            }

            for (const [index, value] of items.entries()) {
                controls[index].patchValue(value);
            }
            this.form.setControl("items", new FormArray(controls));
        } else {
            this.form.setControl("items", new FormArray([this._createEmptyRow(columns)]));
        }
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
