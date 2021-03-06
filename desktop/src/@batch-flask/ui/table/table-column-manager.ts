import { LiveAnnouncer } from "@angular/cdk/a11y";
import { TemplateRef } from "@angular/core";
import { ListDataPresenter, SortingInfo } from "@batch-flask/ui/abstract-list/list-data-presenter";
import { SortDirection } from "@batch-flask/ui/abstract-list/list-data-sorter";
import { SanitizedError, exists } from "@batch-flask/utils";
import { Observable, Subject } from "rxjs";

export interface TableColumnRef {
    id: string;
    name: string;
    defaultWidth: number;
    minWidth: number;
    maxWidth: number;
    sortable: boolean;
    headCellTemplate: TemplateRef<any>;
    cellTemplate: TemplateRef<any>;
}

export class TableColumnManager {
    public sorting: Observable<SortingInfo>;
    public dimensionsChange = new Subject();

    public columnMap = new Map<string, TableColumnRef>();
    public columnOrder: string[] = [];
    private _columns: TableColumnRef[] = [];
    private _dimensions = new Map<string, number>();

    constructor(private dataPresenter: ListDataPresenter, private liveAnnouncer: LiveAnnouncer) {
        this.sorting = dataPresenter.sortingByObs;
    }

    public dispose() {
        this.dimensionsChange.complete();
    }

    public set columns(columns: TableColumnRef[]) {
        this.columnOrder = columns.map((x: TableColumnRef) => x.name);
        this.columnMap.clear();
        for (const column of columns) {
            if (this.columnMap.has(column.name)) {
                throw new SanitizedError(`bl-column name '${column.name}' must be unique`);
            }
            this.columnMap.set(column.name, column);
        }
        this._computeColumns();
    }

    public get columns() {
        return this._columns;
    }

    public updateColumn(ref: TableColumnRef) {
        this.columnMap.set(ref.name, ref);
        this._computeColumns();
    }

    public updateColumnWidth(name: string, width: number) {
        this._setColumnWidth(name, width);
        this.dimensionsChange.next(true);
    }

    /**
     * Batch update of column width to limit notifications
     * @param widths Map of width
     */
    public updateColumnsWidth(widths: StringMap<number>) {
        for (const name of Object.keys(widths)) {
            this._setColumnWidth(name, widths[name]);
        }
        this.dimensionsChange.next(true);
    }

    public getColumnWidth(name: string) {
        const width = this._dimensions.get(name);
        if (exists(width)) { return width; }
        const column = this.columnMap.get(name);
        return column && column.defaultWidth;
    }

    public getAllColumnWidth(): StringMap<number> {
        const result = {};
        for (const column of this.columnMap.keys()) {
            result[column] = this.getColumnWidth(column);
        }
        return result;
    }

    public resetColumnWidth(name: string) {
        this._dimensions.delete(name);
        this.dimensionsChange.next(true);
    }

    public resetAllColumnWidth() {
        this._dimensions.clear();
        this.dimensionsChange.next(true);
    }

    public sortBy(column: string, direction: SortDirection = SortDirection.Asc) {
        const dirStr = direction === SortDirection.Asc ? "Ascending" : "Descending";
        this.liveAnnouncer.announce(`Sorting by ${column} ${dirStr}`);
        this.dataPresenter.sortBy(column, direction);
    }

    private _computeColumns() {
        this._columns = this.columnOrder.map(x => this.columnMap.get(x)!);
        const sortConfig = this.dataPresenter.config =
            (this.dataPresenter.config || {});
        for (const column of this._columns) {
            if (!(column.name in sortConfig)) {
                sortConfig[column.name] = column.sortable;
            }
        }
    }

    private _setColumnWidth(name: string, width: number) {
        const column = this.columnMap.get(name);
        if (!column) { return; }

        if (width < column.minWidth) {
            width = column.minWidth;
        }
        if (column.maxWidth && width > column.maxWidth) {
            width = column.maxWidth;
        }
        this._dimensions.set(name, width);
    }
}
