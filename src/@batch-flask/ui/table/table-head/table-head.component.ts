import {
    AfterContentInit, Component, ContentChildren, Inject, QueryList, forwardRef,
} from "@angular/core";

import { BehaviorSubject, Observable, Subject } from "rxjs";
import { TableColumnComponent } from "../table-column";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-thead",
    templateUrl: "table-head.html",
})
export class TableHeadComponent implements AfterContentInit {
    @ContentChildren(TableColumnComponent)
    public items: QueryList<TableColumnComponent>;

    public dimensions: Observable<number[]>;

    private _columnIndexMap: StringMap<number>;
    private _dimensions = new BehaviorSubject([]);

    // tslint:disable-next-line:no-forward-ref
    constructor(@Inject(forwardRef(() => TableComponent)) public table: TableComponent) {
        this.dimensions = this._dimensions.asObservable();
    }

    public ngAfterContentInit() {
        this.items.changes.subscribe(() => {
            this._updateColumnIndexMap();
            this.updateDimensions();
        });
        this._updateColumnIndexMap();
        this.updateDimensions();
    }

    public getColumnIndex(column: TableColumnComponent) {
        if (!(column.id in this._columnIndexMap)) {
            return -1;
        }
        return this._columnIndexMap[column.id];
    }

    public updateDimensions() {
        if (!this.items) { return; }
        const dimensions = [];
        this.items.forEach((column, index) => {
            dimensions[index] = column.width;
        });
        this._dimensions.next(dimensions);
    }

    private _updateColumnIndexMap() {
        const map = {};
        this.items.forEach((column, index) => {
            map[column.id] = index;
        });
        this._columnIndexMap = map;
    }

}
