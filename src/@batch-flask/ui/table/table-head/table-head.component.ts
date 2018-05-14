import {
    AfterViewInit, ChangeDetectionStrategy,
    ChangeDetectorRef, Component, Inject, Input, forwardRef,
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
export class TableHeadComponent implements AfterViewInit {
    @Input() public show: boolean; // TODO-TIM remove

    @Input() public columns: TableColumnRef[];

    public dimensions: Observable<number[]>;

    private _columnIndexMap: StringMap<number>;
    private _dimensions = new BehaviorSubject([]);

    // tslint:disable-next-line:no-forward-ref
    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        private changeDetector: ChangeDetectorRef) {
        this.dimensions = this._dimensions.asObservable();
    }

    public ngAfterViewInit() {
    }

    public update() {
    }

    public getColumnIndex(column: TableColumnComponent) {
        if (!(column.id in this._columnIndexMap)) {
            return -1;
        }
        return this._columnIndexMap[column.id];
    }

    public updateDimensions() {
        // if (!this.items) { return; }
        // const dimensions = [];
        // this.items.forEach((column, index) => {
        //     dimensions[index] = column.width;
        // });
        // this._dimensions.next(dimensions);
    }

    public trackColumn(index, column) {
        return column.name;
    }

}
