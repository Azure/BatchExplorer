import { TemplateRef } from "@angular/core";

export interface TableColumnRef {
    name: string;
    width: number;
    sortable: boolean;
    isSorting: boolean;
    headerContent: TemplateRef<any>;
    cellTemplate: TemplateRef<any>;
}

export class TableColumnManager {
    public columnMap = new Map<string, TableColumnRef>();
    public columnOrder = [];
    private _columns = [];

    public set columns(columns: TableColumnRef[]) {
        this.columnOrder = columns.map(x => x.name);
        this.columnMap.clear();
        for (const column of columns) {
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

    private _computeColumns() {
        this._columns = this.columnOrder.map(x => this.columnMap.get(x));
    }
}
