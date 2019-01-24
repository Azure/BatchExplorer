import { Injectable } from "@angular/core";
import { DataStore, GlobalStorage, InMemoryDataStore } from "@batch-flask/core";

/**
 * Implementation of the browser local storage
 */
@Injectable()
export class LocalDataStore extends InMemoryDataStore implements DataStore {

    public static readonly KEY = "global";

    private _loadPromise: Promise<any>;

    constructor(private storage: GlobalStorage) {
        super();
        this.load();
    }

    public async setItem<T = string>(key: string, value: T) {
        await this._loadPromise;
        await super.setItem(key, value);
        return this._save();
    }

    public async getItem<T = string>(key: string): Promise<T | undefined> {
        await this._loadPromise;
        return super.getItem<T>(key);
    }

    public async removeItem(key: string) {
        await this._loadPromise;
        delete this._data[key];
        return this._save();
    }

    public async load() {
        this._loadPromise = this.storage.get<any>(LocalDataStore.KEY).then((data) => {
            this._data = new Map(Object.entries(data));
            return data;
        });
        return this._loadPromise;
    }

    public async clear() {
        await super.clear();
        await this._save();
    }

    private async _save(): Promise<void> {
        const obj = {};
        for (const [key, value] of this._data.entries()) {
            obj[key] = value;
        }
        await this.storage.set(LocalDataStore.KEY, obj);
    }
}
