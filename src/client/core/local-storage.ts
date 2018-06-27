import { Injectable } from "@angular/core";
import { LocalFileStorage } from "./local-file-storage";

const fileKey = "node-local-storage";

/**
 * Implementation of the browser local storage
 */
@Injectable()
export class LocalStorage {
    private _data: StringMap<string> = {};
    private _loadPromise: Promise<any>;

    constructor(private localFileStorage: LocalFileStorage) {
        this.load();
    }

    public async setItem(key: string, value: string) {
        return this._loadPromise.then(() => {
            this._data[key] = value;
            return this._save();
        });
    }

    public async getItem(key: string): Promise<string> {
        await this._loadPromise;
        return this._data[key];
    }

    public async removeItem(key: string) {
        await this._loadPromise;
        delete this._data[key];
        return this._save();
    }

    public async load() {
        this._loadPromise = this.localFileStorage.get<any>(fileKey).then((data) => {
            this._data = data;
            return data;
        });
        return this._loadPromise;
    }

    public async clear() {
        this._data = {};
        return this._save();
    }

    public get length(): number {
        return Object.keys(this._data).length;
    }

    private async _save() {
        return this.localFileStorage.set(fileKey, this._data);
    }
}
