import { LocalFileStorage } from "./local-file-storage";

const localFileStorage = new LocalFileStorage();

const fileKey = "node-local-storage";
/**
 * Implementation of the browser local storage
 */
export class LocalStorage {
    private _data: StringMap<string>;
    private _loadPromise: Promise<any>;

    constructor() {
        this._load();
    }

    public async setItem(key: string, value: string) {
        await this._loadPromise;
        this._data[key] = value;
        return this._save();
    }

    public async getItem(key: string): Promise<string> {
        await this._loadPromise;
        return this._data[key];
    }

    public async removeItem(key: string) {
        await this._loadPromise;
        delete this._data;
        return this._save();
    }

    private async _load() {
        this._loadPromise = localFileStorage.get<any>(fileKey).then((data) => {
            this._data = data;
        });
        return this._loadPromise;
    }

    private async _save() {
        return localFileStorage.set(fileKey, this._data);
    }
}

export const localStorage = new LocalStorage();
