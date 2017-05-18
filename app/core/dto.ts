import { nil } from "app/utils";

const primitives = new Set(["Array", "Number", "String", "Object", "Boolean"]);

const attrMetadataKey = "dto:attrs";

function metadataForDto<T>(dto: Dto<T>) {
    return Reflect.getMetadata(attrMetadataKey, dto.constructor) || {};
}
/**
 * Dto should be the base class for all dto.
 * It will only assign defined attributes.
 */
export class Dto<T> {
    constructor(data: AttrOf<T>) {
        const attrs = metadataForDto(this);
        for (let key of Object.keys(attrs)) {
            const type = attrs[key];
            if (!(key in data)) {
                continue;
            }
            const value = (data as any)[key];
            if (nil(value)) {
                continue;
            }

            if (type && !primitives.has(type.name)) {
                this[key] = new type(value);
            } else {
                this[key] = value;
            }
        }
    }

    public toJS?(): AttrOf<T> {
        let output: any = {};
        const attrs = metadataForDto(this);
        for (let key of Object.keys(attrs)) {
            if (!(key in this)) {
                continue;
            }
            const value = this[key];
            if (nil(value)) {
                continue;
            }
            if (value.toJS) {
                output[key] = value.toJS();
            } else {
                output[key] = value;
            }
        }
        return output;
    }
}

export function DtoAttr<T>() {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        const type = Reflect.getMetadata("design:type", target, attr);
        if (!type) {
            throw new Error(`Cannot retrieve the type for DtoAttr ${target.constructor.name}#${attr}`
            + "Check your nested type is defined in another file or above this DtoAttr");
        }
        const metadata = Reflect.getMetadata(attrMetadataKey, ctr) || {};
        metadata[attr] = type;
        Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
    };
}
