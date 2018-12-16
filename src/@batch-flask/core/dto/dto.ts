import { SanitizedError, nil } from "@batch-flask/utils";

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
    constructor(data: Partial<AttrOf<T>>) {
        const attrs = metadataForDto(this);
        for (const key of Object.keys(attrs)) {
            const typeMetadata = attrs[key];
            if (!(key in data)) {
                continue;
            }
            const value = (data as any)[key];
            if (nil(value)) {
                continue;
            }

            if (typeMetadata) {
                const isPrimitive = primitives.has(typeMetadata.type.name);
                if (typeMetadata.list) {
                    this[key] = value && value.map(x => isPrimitive ? x : new typeMetadata.type(x));
                } else {
                    if (isPrimitive) {
                        this[key] = value;
                    } else {
                        this[key] = new typeMetadata.type(value);
                    }
                }
            } else {
                this[key] = value;
            }
        }
    }

    public merge?(other: this): this {
        const data = { ...(this.toJS!() as any), ...(other.toJS!() as any) };
        return new (this.constructor as any)(data);
    }

    public toJS?(): AttrOf<T> {
        const output: any = {};
        const attrs = metadataForDto(this);
        for (const key of Object.keys(attrs)) {
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

export function DtoAttr<T>(type?: any) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        if (!type) {
            type = Reflect.getMetadata("design:type", target, attr);
        }
        if (!type) {
            throw new SanitizedError(`Cannot retrieve the type for DtoAttr ${target.constructor.name}#${attr}`
                + "Check your nested type is defined in another file or above this DtoAttr");
        }
        const metadata = Reflect.getMetadata(attrMetadataKey, ctr) || {};
        metadata[attr] = {type};
        Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
    };
}

export function ListDtoAttr<T>(type: any) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        const metadata = Reflect.getMetadata(attrMetadataKey, ctr) || {};
        metadata[attr] = {type, list: true};
        Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
    };
}
