import { log } from "@batch-flask/utils";

const attrMetadataKey = "csscolor:attrs";

export function CssColor<T>(name?: string) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        const type = Reflect.getMetadata("design:type", target, attr);
        if (name === undefined) { name = attr; }
        const metadata = Reflect.getMetadata(attrMetadataKey, ctr) || {};
        metadata[attr] = { name, type };
        Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
    };
}

export class ThemeElement<ThemeInput> {

    constructor(data: ThemeInput) {
        if (!data || typeof data === "string") {
            return;
        }
        for (const { attr, metadata } of this._getAttrs()) {
            const { name, type } = metadata;
            if (name in data) {
                const value = data[name];
                if (type.name === "String") {
                    this[attr] = value;
                } else {
                    this[attr] = new type(value);
                }
            }
        }
    }

    public asCss(): Array<{ key: string, value: string }> {
        let css = [];
        for (const { attr, metadata } of this._getAttrs()) {
            const { name } = metadata;
            const value = this[attr];
            if (typeof value === "string") {
                css.push({
                    key: name,
                    value: this[attr],
                });
            } else if (value instanceof ThemeElement) {
                css = css.concat(value.asCss().map(({ key, value }) => {
                    return {
                        key: key ? `${name}-${key}` : name,
                        value,
                    };
                }));
            } else {
                log.error(`Theme element has unknown attribute. ${attr}`
                    + " If it's an attribute not a string make sure to extends ThemeElement", { attr, name, value });
            }
        }
        return css;
    }

    private _getAttrs() {
        const data = Reflect.getMetadata(attrMetadataKey, this.constructor) || {};
        return Object.keys(data).map(attr => ({ attr, metadata: data[attr] }));
    }
}
