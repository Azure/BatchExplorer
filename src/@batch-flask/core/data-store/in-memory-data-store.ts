import { DataStore } from "./data-store";

export class InMemoryDataStore implements DataStore {
    protected _data = new Map<string, any>();

    public async setItem<T>(key: string, value: T): Promise<void> {
        this._data.set(key, value);
        return Promise.resolve();
    }

    public async getItem<T>(key: string): Promise<T> {
        return Promise.resolve(this._data.get(key));
    }

    public async removeItem(key: string): Promise<void> {
        this._data.delete(key);
        return Promise.resolve();
    }

    public async clear(): Promise<void> {
        this._data.clear();
        return Promise.resolve();
    }

    public get size() {
        return this._data.size;
    }
}
