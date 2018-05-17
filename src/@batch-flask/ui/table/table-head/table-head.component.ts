import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Input,
    forwardRef,
} from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";
import { TableColumnComponent } from "../table-column";
import { TableColumnRef } from "../table-column-manager";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-thead",
    templateUrl: "table-head.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeadComponent {
    @Input() public columns: TableColumnRef[];

    public dimensions: Observable<number[]>;

    private _columnIndexMap: StringMap<number>;
    private _dimensions = new BehaviorSubject([]);

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent) {
        this.dimensions = this._dimensions.asObservable();
    }

    public getColumnIndex(column: TableColumnComponent) {
        if (!(column.id in this._columnIndexMap)) {
            return -1;
        }
        return this._columnIndexMap[column.id];
    }

    public trackColumn(index, column) {
        return column.name;
    }

    public handleStartResize(column: TableColumnRef) {
        console.log("Resizing");
    }
}
