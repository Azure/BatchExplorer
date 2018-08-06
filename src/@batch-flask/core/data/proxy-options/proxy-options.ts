import { ObjectUtils } from "@batch-flask/utils";

export interface OptionsBase {
    select?: string;

    /**
     * Other options
     */
    [key: string]: any;
}

export class ProxyOptions {
    public select: string;

    /**
     * All the remaining attributes
     */
    public attributes: { [key: string]: any };
    public original: OptionsBase;

    constructor(attributes: OptionsBase | ProxyOptions) {
        if (attributes instanceof ProxyOptions) {
            attributes = attributes.original;
        }
        this.select = attributes.select;
        this.attributes = ObjectUtils.except(attributes, this.specialAttributes());
        this.original = attributes;
    }

    public isEmpty(): boolean {
        return !this.original || Object.keys(this.original).length === 0;
    }

    /**
     * Merge other list options with this one and return the newly built options
     * @param other Other options to merge(Anything given there will override this)
     */
    public merge(other: this): this {
        const constructor = this.constructor as any;
        return new constructor(Object.assign({}, this.original, other.original));
    }

    /**
     * Similar to #merge() but the given options are used as default.
     * This means it will only merge if the attribute is not defined localy.
     */
    public mergeDefault(defaults: this): this {
        return defaults.merge(this);
    }

    /**
     * This contains the list of attributes that should be excluded from the attributes property
     */
    protected specialAttributes(): string[] {
        return ["select"];
    }
}
