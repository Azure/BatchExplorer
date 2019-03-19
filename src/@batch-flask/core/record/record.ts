import { exists, nil } from "@batch-flask/utils/object-utils";
import { List, Map } from "immutable";
import { Duration } from "luxon";
import { metadataForRecord, primitives } from "./helpers";

/**
 * Base class for a record.
 * @template TInput Interface of the data returned by the server.
 */
export class Record<TInput> {
    public _original: Partial<TInput>;
    private _map: Map<string, any> = Map({});
    private _defaultValues = {};
    // Stringify version of the properties to use to compare efficiently
    private _originalStr: string;
    // @ts-ignore
    private _initialized = false;
    // @ts-ignore
    private _keys: Set<string>;

    constructor(data: Partial<TInput> = {}) {
        this._original = data;
        this._originalStr = JSON.stringify(data);
        this._init(data);
    }

    public equals(other: this) {
        return this === other || this._originalStr === other._originalStr;
    }

    public get(key: string) {
        return this._map.get(key);
    }

    public toJS(): any {
        return { ...this._defaultValues, ... this._toJS() };
    }

    public merge(other: Partial<TInput>): this {
        const ctr: any = this.constructor;
        return new ctr({ ...this.toJS(), ...other as any });
    }

    /**
     * DO NOT USE. For interal use only
     */
    protected _completeInitialization() {
        this._initialized = true;
    }

    private _toJS() {
        const output: any = {};
        const attrs = metadataForRecord(this);

        for (const key of Object.keys(attrs)) {
            if (!(key in this)) {
                continue;
            }
            const value = this[key];
            if (nil(value)) {
                output[key] = value;
            } else if (value.toJS) {
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
    private _init(data: any) {
        const attrs = metadataForRecord(this);
        const obj = {};
        const keys = Object.keys(attrs);
        this._keys = new Set(keys);

        for (const key of keys) {
            this._defaultValues[key] = null;
            const typeMetadata = attrs[key];
            if (!(key in data)) {
                continue;
            }

            const value = (data as any)[key];
            if (exists(value) && typeMetadata) {
                if (typeMetadata.list) {
                    obj[key] = List(value && value.map(x => this._createType(typeMetadata.type, x)));
                } else {
                    obj[key] = this._createType(typeMetadata.type, value);

                    if (typeMetadata.transform) {
                        obj[key] = typeMetadata.transform(obj[key]);
                    }
                }
            } else {
                obj[key] = value;
            }
        }

        this._map = Map(obj);
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
