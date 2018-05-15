import { TemplateRef } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface TableColumnRef {
    name: string;
    width: number;
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

    public columnMap = new Map<string, TableColumnRef>();
    public columnOrder = [];
    private _columns = [];
    private _sorting = new BehaviorSubject<SortingInfo>(null);

    constructor() {
        this.sorting = this._sorting.asObservable();
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

    public sortBy(column: string, direction: SortDirection = SortDirection.Asc) {
        this._sorting.next({ column, direction });
    }

    private _computeColumns() {
        this._columns = this.columnOrder.map(x => this.columnMap.get(x));
    }
}
