import { AbstractListItem } from "./abstract-list-item";

export enum SortDirection {
    Asc,
    Desc,
}

export interface SortConfig<TEntity> {
    [key: string]: boolean | ((item: TEntity) => any);
}

export class ListDataSorter {

    constructor(public config: {
        values: StringMap<(item: AbstractListItem) => any>;
    }) {

    }
    public sortBy(items: AbstractListItem[], attribute: string, direction: SortDirection = SortDirection.Desc) {
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

    private _columnValueFn(attribute: string) {
        if (this.config.values && attribute in this.config.values) {
            return this.config.values[attribute];
        } else {
            return (item) => item[attribute];
        }
    }
}
