import { ObjectUtils } from "app/utils";
import { OptionsBase } from "./rx-proxy-base";

export interface ListOptionsAttributes extends OptionsBase {
    /**
     * Maximum number of items to fetch at the same time
     * If not provided but maxItems is it will use maxItems value
     */
    pageSize?: number;

    /**
     * Maximum number of items to return from the list proxy(If you only want to show the first 5 items)
     */
    maxItems?: number;

    /**
     *
     */
    filter?: string;

    /**
     * Other options
     */
    [key: string]: any;
}

export class ListOptions {
    public pageSize: number;
    public maxItems: number;
    public filter: string;
    public select: string;

    public attributes: { [key: string]: any };

    public original: ListOptionsAttributes;

    constructor(attributes: ListOptionsAttributes) {
        this.pageSize = attributes.pageSize;
        this.maxItems = attributes.maxItems;
        this.filter = attributes.filter;
        this.select = attributes.select;
        this.attributes = ObjectUtils.except(attributes, ["select", "filter", "maxItems", "pageSize"]);
        this.original = attributes;
    }

    public isEmpty(): boolean {
        return !this.original || Object.keys(this.original).length === 0;
    }

    /**
     * Merge other list options with this one and return the newly built options
     * @param other Other options to merge(Anything given there will override this)
     */
    public merge(other: ListOptions): ListOptions {
        return new ListOptions(Object.assign({}, this.original, other.original));
    }

    /**
     * Similar to #merge() but the given options are used as default.
     * This means it will only merge if the attribute is not defined localy.
     */
    public mergeDefault(defaults: ListOptions): ListOptions {
        return defaults.merge(this);
    }

    /**
     * Computed value using the pageSize and maxItems provided.
     */
    public get maxResults(): number {
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
