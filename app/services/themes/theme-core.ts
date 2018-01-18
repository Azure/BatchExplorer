import { log } from "app/utils";

const attrMetadataKey = "csscolor:attrs";

export function CssColor<T>(name?: string) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        if (name === undefined) { name = attr; }
        const metadata = Reflect.getMetadata(attrMetadataKey, ctr) || {};
        metadata[attr] = { name };
        Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
    };
}

export class ThemeElement {
    public asCss(): Array<{ key: string, value: string }> {
        const metadata = Reflect.getMetadata(attrMetadataKey, this.constructor) || {};
        let css = [];
        for (const key of Object.keys(metadata)) {
            const { name } = metadata[key];
            const value = this[key];
            if (typeof value === "string") {
                css.push({
                    key: name,
                    value: this[key],
                });
            } else if (value instanceof ThemeElement) {
                css = css.concat(value.asCss().map(({ key, value }) => {
                    return {
                        key: key ? `${name}-${key}` : name,
                        value,
                    };
                }));
            } else {
                log.error("Theme element has unknown attribute."
                    + "If attribute not a string make sure to extends ThemeElement", { key, name });
            }
        }
        return css;
    }
}
