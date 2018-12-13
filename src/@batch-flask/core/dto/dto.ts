import { SanitizedError, nil } from "@batch-flask/utils";
import { Duration } from "luxon";

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
                if (typeMetadata.list) {
                    this[key] = value && value.map(x => this._createType(typeMetadata.type, x));
                } else {
                    this[key] = this._createType(typeMetadata.type, value);
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

    private _createType(type: any, value: any) {
        const isPrimitive = primitives.has(type.name);
        if (isPrimitive) {
            return value;
        }
        if (type === Duration) {
            if (value instanceof Duration) {
                return value;
            } else if (typeof value === "string") {
                return Duration.fromISO(value);
            } else {
                return Duration.fromObject(value);
            }
        }
        return new type(value);
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
        metadata[attr] = { type };
        Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
    };
}

export function ListDtoAttr<T>(type: any) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        const metadata = Reflect.getMetadata(attrMetadataKey, ctr) || {};
        metadata[attr] = { type, list: true };
        Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
    };
}
