import { Filter } from "@batch-flask/core/filter-builder";
import { OptionsBase, ProxyOptions } from "../proxy-options";

export interface ContinuationToken {
    params: any;
    options: ListOptions;
    nextLink: string;
}

export interface ListOptionsAttributes extends OptionsBase {
    /**
     * Maximum number of items to fetch at the same time
     * If not provided but maxItems is it will use maxItems value
     */
    pageSize?: number | null;

    /**
     * Maximum number of items to return from the list proxy(If you only want to show the first 5 items)
     */
    maxItems?: number | null;

    /**
     *
     */
    filter?: Filter | null;

    /**
     * Other options
     */
    [key: string]: any;
}

export class ListOptions extends ProxyOptions {
    public pageSize: number | null;
    public maxItems: number | null;
    public filter: Filter | null;

    public original: ListOptionsAttributes;

    constructor(attributes: ListOptionsAttributes | ListOptions = {}) {
        super(attributes);
        this.pageSize = this.original.pageSize || null;
        this.maxItems = this.original.maxItems || null;
        this.filter = this.original.filter || null;
    }

    protected specialAttributes(): string[] {
        return super.specialAttributes().concat(["filter", "maxItems", "pageSize"]);
    }

    /**
     * Computed value using the pageSize and maxItems provided.
     */
    public get maxResults(): number | null {
        const { maxItems, pageSize } = this;
        if (!pageSize) {
            return maxItems || null;
        }
        if (!maxItems) {
            return pageSize || null;
        }

        if (maxItems < pageSize) {
            return maxItems;
        } else {
            return pageSize;
        }
    }
}
