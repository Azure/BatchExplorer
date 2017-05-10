import { List, Map } from "immutable";

import { metadataForRecord, primitives } from "./helpers";

/**
 * Base class for a record.
 * @template TInput Interface of the data returned by the server.
 */
export class Record<TInput> {
    private _map: Map<string, any> = Map({});
    // tslint:disable-next-line:no-unused-variable
    private _defaultValues = {};
    private _initialized = false;
    private _keys: Set<string>;

    constructor(data: Partial<TInput> = {}) {
        this._init(data);
    }

    public equals(other: this) {
        return this === other || this._map.equals(other._map);
    }

    public get(key: string) {
        return this._map.get(key);
    }

    public toJS(): any {
        return this._map.toJS();
    }

    /**
     * This method will be called by the decorator.
     */
    private _init(data: any) {
        const attrs = metadataForRecord(this);
        const obj = {};
        const keys = Object.keys(attrs);
        this._keys = new Set(keys);
        for (let key of keys) {
            const typeMetadata = attrs[key];
            if (!(key in data)) {
                continue;
            }
            const value = (data as any)[key];
            if (typeMetadata && !primitives.has(typeMetadata.type.name)) {
                if (typeMetadata.list) {
                    obj[key] = List(value && value.map(x => new typeMetadata.type(x)));
                } else {
                    obj[key] = new typeMetadata.type(value);
                }
            } else {
                obj[key] = value;
            }
        }
        this._map = Map(obj);
    }

    // tslint:disable-next-line:no-unused-variable
    private _completeInitialization() {
        this._initialized = true;
    }
}
