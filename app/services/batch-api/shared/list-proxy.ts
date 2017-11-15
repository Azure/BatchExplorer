import { BatchResult } from "../models";

export interface ListProxyEntity {
    list: (...args) => void;

    /**
     * ListNext funtion of the batch-client if applicable(Some list return everything at once)
     */
    listNext?: (...args) => void;
}

/**
 * List proxy, handle continuation tokens
 */
export class ListProxy {
    public nextLink: string;
    private items: any[];

    private loadedFirst = false;
    private currentPromise: Promise<BatchResult> = null;

    constructor(private entity: ListProxyEntity, private params: any[], private options: any) {
        this.nextLink = null;
        this.items = [];
        this.params = this.params || [];
    }

    public hasMoreItems(): boolean {
        return !this.loadedFirst || !!(this.nextLink);
    }

    public fetchNext(): Promise<BatchResult> {
        if (this.currentPromise) {
            return this.currentPromise;
        } else if (!this.hasMoreItems()) {
            return Promise.resolve({
                data: [],
            });
        } else {
            if (this.nextLink) {
                this.currentPromise = this._listNext();
            } else {
                this.currentPromise = this._list();
            }
            this.currentPromise.then(() => {
                this.currentPromise = null;
            }).catch(() => {
                this.currentPromise = null;
            });
            return this.currentPromise;
        }
    }

    public clone(): ListProxy {
        const clone = new ListProxy(this.entity, this.params, this.options);
        clone.nextLink = this.nextLink;
        clone.items = this.items;
        clone.loadedFirst = this.loadedFirst;
        clone.currentPromise = this.currentPromise;
        return clone;
    }

    private async _list(): Promise<BatchResult> {
        const result = await this.entity.list(...this.params, this.options);
        return this._processResult(result);
    }

    private async _listNext(): Promise<BatchResult> {
        const result = this.entity.listNext(this.nextLink);
        return this._processResult(result);
    }

    private _processResult(result) {
        this.loadedFirst = true;

        this.nextLink = result.odatanextLink;

        this.items.concat(result);

        /**
         * Check for result.value as MPI subtasks return { value: [] }
         */
        return {
            data: Array.isArray(result) ? result : result.value,
        };
    }
}
