import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { log } from "@batch-flask/utils";
import { List } from "immutable";
import { BehaviorSubject, Subject, of } from "rxjs";
import { catchError, switchMap, takeUntil } from "rxjs/operators";
import { EditableTableSelectOptions } from "../editable-table-column.component";

@Component({
    selector: "bl-editable-table-select-cell",
    templateUrl: "editable-table-select-cell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableTableSelectCellComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public control: FormControl;
    @Input() public options: EditableTableSelectOptions;
    @Input() public rowValue: StringMap<any>;

    public actualOptions: string[] = [];
    public loadingOptions = true;

    private _rowValue = new BehaviorSubject<StringMap<any>>({});
    private _options = new BehaviorSubject<EditableTableSelectOptions | null>(null);
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this._options.pipe(
            takeUntil(this._destroy),
            switchMap((options) => {
                if (Array.isArray(options)) {
                    return of(options);
                } else if (options instanceof List) {
                    return of((options as List<string>).toArray());
                } else {
                    return this._rowValue.pipe(
                        (options as Function)(),
                        catchError((error) => {
                            log.error(`Error loading options`, error);
                            return null;
                        }),
                    );
                }
            }),
        ).subscribe((options: string[] | null) => {
            this.loadingOptions = false;
            if (!options) { return; }
            this.actualOptions = options;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.options) {
            this._options.next(this.options);
        }
        if (changes.rowValue) {
            this._rowValue.next(this.rowValue);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
}
