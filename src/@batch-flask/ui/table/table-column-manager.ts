import { TemplateRef } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

export interface TableColumnRef {
    name: string;
    defaultWidth: number;
    sortable: boolean;
    isSorting: boolean;
    headCellTemplate: TemplateRef<any>;
    cellTemplate: TemplateRef<any>;
}

export interface SortingInfo {
    column: string;
    direction: SortDirection;
}

export enum SortDirection {
    Asc,
    Desc,
}

export class TableColumnManager {
    public sorting: Observable<SortingInfo>;
    public dimensionsChange = new Subject();

    public columnMap = new Map<string, TableColumnRef>();
    public columnOrder = [];
    private _columns = [];
    private _sorting = new BehaviorSubject<SortingInfo>(null);
    private _dimensions = new Map<string, number>();

    constructor() {
        this.sorting = this._sorting.asObservable();
    }

    public dispose() {
        this._sorting.complete();
        this.dimensionsChange.complete();
    }

    public set columns(columns: TableColumnRef[]) {
        this.columnOrder = columns.map(x => x.name);
        this.columnMap.clear();
        for (const column of columns) {
            if (this.columnMap.has(column.name)) {
                throw new Error(`bl-column name '${column.name}' must be unique`);
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
        this._dimensions.set(name, width);
        this.dimensionsChange.next(true);
    }

    public getColumnWidth(name: string) {
        return this._dimensions.get(name) || this.columnMap.get(name).defaultWidth;
    }

    public getAllColumnWidth(): StringMap<number> {
        const result = {};
        for (const column of this.columnMap.keys()) {
            result[column] = this.getColumnWidth(column);
        }
        return result;
    }

    public sortBy(column: string, direction: SortDirection = SortDirection.Asc) {
        this._sorting.next({ column, direction });
    }

    private _computeColumns() {
        this._columns = this.columnOrder.map(x => this.columnMap.get(x));
    }
}
