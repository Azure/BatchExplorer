import { Injectable } from "@angular/core";
import { DataStore, InMemoryDataStore } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import * as path from "path";
import { FileSystem } from "../fs";
import { CryptoService } from "./crypto-service";

const SECRET_DATA_FILE = "data/secure.enc";

/**
 * Implementation of the browser local storage
 */
@Injectable({ providedIn: "root" })
export class SecureDataStore extends InMemoryDataStore implements DataStore {
    private _loadPromise: Promise<void>;

    constructor(private fs: FileSystem, private crypto: CryptoService) {
        super();
        this._loadPromise = this._load();
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

    public async clear() {
        await super.clear();
        await this._save();
    }

    private async _save(): Promise<void> {
        const obj = {};
        for (const [key, value] of this._data.entries()) {
            obj[key] = value;
        }
        const content = JSON.stringify(obj);
        const encryptedContent = await this.crypto.encrypt(content);
        await this.fs.saveFile(this._getFile(), encryptedContent);
    }

    private async _load(): Promise<void> {
        const encryptedContent: string | null = await this.fs.readFile(this._getFile()).catch(_ => null);
        if (!encryptedContent) {
            return;
        }
        const content = await this.crypto.decrypt(encryptedContent);

        try {
            const data = JSON.parse(content);
            this._data = new Map(Object.entries(data));
        } catch (e) {
            log.error("Invalid JSON in the secret store file. This could be because we lost the master key.");
        }
    }

    private _getFile() {
        return path.join(this.fs.commonFolders.userData, SECRET_DATA_FILE);
    }
}
