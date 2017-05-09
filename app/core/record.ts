import { Type } from "@angular/core";
import { nil } from "app/utils";
import { List, Map } from "immutable";

const attrMetadataKey = "record:attrs";
const primitives = new Set(["Array", "Number", "String", "Object", "Boolean"]);

function metadataForRecord<T>(dto: Record) {
    return Reflect.getMetadata(attrMetadataKey, dto.constructor) || {};
}

export class Record {
    private _map: Map<string, any> = Map({});
    private _defaultValues = {};
    private _initialized = false;

    constructor(private _data: any = {}) {

    }

    public toJS?(): any {
        let output: any = {};
        const attrs = metadataForRecord(this);
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

    /**
     * This method will be called by the decorator.
     */
    // tslint:disable-next-line:no-unused-variable
    private _init() {
        const data = this._data;
        const attrs = metadataForRecord(this);
        const obj = {};
        for (let key of Object.keys(attrs)) {
            const typeMetadata = attrs[key];
            if (!(key in data)) {
                obj[key] = this._defaultValues[key];
                continue;
            }
            const value = (data as any)[key];
            if (typeMetadata && !primitives.has(typeMetadata.type.name)) {
                if (typeMetadata.list) {
                    console.log("is list", value);
                    obj[key] = List(value && value.map(x => new typeMetadata.type(x)));
                } else {
                    obj[key] = new typeMetadata.type(value);
                }
            } else {
                obj[key] = value;
            }
        }
        this._map = Map(obj);
        this._initialized = true;
    }
}

interface TypeMetadata {
    list: boolean;
    type: Type<any>;

}
function updateTypeMetadata(ctr: Type<any>, attr: string, type: TypeMetadata) {
    const metadata = Reflect.getMetadata(attrMetadataKey, ctr) || {};
    metadata[attr] = type;
    Reflect.defineMetadata(attrMetadataKey, metadata, ctr);
}

function setProp(ctr: Type<any>, attr: string) {
    Object.defineProperty(ctr.prototype, attr, {
        get: function (this: Record) {
            return (this as any)._map.get(attr);
        },
        set: function <T>(this: Record, value: T) {
            if ((this as any)._initialized) {
                throw `Cannot set attribute ${attr} of immutable Record ${this.constructor.name}!`;
            } else {
                const defaults = (this as any)._defaultValues;
                defaults[attr] = value;
            }
        },
    });
}

// tslint:disable:only-arrow-functions
export function Attr<T>(...args) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        const type = Reflect.getMetadata("design:type", target, attr);
        if (!type) {
            throw `Cannot retrieve the type for RecordAttribute ${target.constructor.name}#${attr}`
            + "Check your nested type is defined in another file or above this DtoAttr";
        }

        updateTypeMetadata(ctr, attr, { type, list: false });
        if (descriptor) {
            descriptor.writable = false;
        } else {
            setProp(ctr, attr);
        }
    };
}

export function ListAttr<T>(type: any) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        updateTypeMetadata(ctr, attr, { type, list: true });

        if (descriptor) {
            descriptor.writable = false;
        } else {
            setProp(ctr, attr);
        }
    };
}

/**
 * Execption to be thrown if the user created a model with the @Model decorator but forgot to extend the Record class.
 */
export class RecordMissingExtendsError extends Error {
    constructor(ctr: Function) {
        super(`Class ${ctr.name} with the @Model Decorator should also extends the Record class`);
    }
}

export function Model() {
    return <T extends { new (...args: any[]): {} }>(ctr: T) => {
        if (!(ctr.prototype instanceof Record)) {
            throw new RecordMissingExtendsError(ctr);
        }
        // save a reference to the original constructor
        const original = ctr;

        // the new constructor behaviour
        const f: any = function (this: T, ...args) {
            const obj = original.apply(this, args);
            obj._init();
            return obj;
        };

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        // return new constructor (will override original)
        return f;
    };
}
