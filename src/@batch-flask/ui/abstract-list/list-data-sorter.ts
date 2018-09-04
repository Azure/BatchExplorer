import { AbstractListItem } from "./abstract-list-item";

export enum SortDirection {
    Asc,
    Desc,
}

export enum SortingStatus {
    /**
     * Status when not all the items are loaded from the server.
     */
    Partial,

    /**
     * Status when there is too many items and it won't resort sort unless manually triggered
     */
    OutOfDate,

    /**
     * Displaying the items sorted
     */
    Valid,
}

export interface ListSortConfig<TEntity> {
    [key: string]: boolean | ((item: TEntity) => any);
}

export class ListDataSorter<TEntity> {

    constructor(public config: ListSortConfig<TEntity>) {

    }

    public sortBy(items: AbstractListItem[], attribute: string, direction: SortDirection) {
        const getColumnValue = this._columnValueFn(attribute);

        const sortedRows = [...items].sort((a, b) => {
            const aValue = getColumnValue(a);
            const bValue = getColumnValue(b);
            if (aValue < bValue) {
                return -1;
            } else if (aValue > bValue) {
                return 1;
            }
            return 0;
        });

        const desc = direction === SortDirection.Desc;
        if (desc) {
            return sortedRows.reverse();
        }
        return sortedRows;
    }

    private _columnValueFn(attribute: string): (item: AbstractListItem) => any {
        if (attribute in this.config && typeof this.config[attribute] === "function") {
            return this.config[attribute] as any;
        } else {
            return (item) => item[attribute];
        }
    }
}
