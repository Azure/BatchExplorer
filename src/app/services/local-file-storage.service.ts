import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { LocalFileStorage as NodeLocalFileStorage } from "client/core";
import { Observable, from } from "rxjs";
import { BatchExplorerService } from "./batch-explorer.service";

/**
 * This service is used to read/write files to the user data folder.
 * Prefer this for writing big data over LocalFileStorage
 * Each key is a different file under userData.
 */
@Injectable({providedIn: "root"})
export class LocalFileStorage {
    private _localStorage: NodeLocalFileStorage;

    constructor(batchExplorer: BatchExplorerService) {
        this._localStorage = batchExplorer.getLocalFileStorage();

    }

    /**
     * @param key Key where the data is store
     * @returns Observable which will resolve the data contained in the file if successful or reject if any error
     */
    public get<T>(key: string): Observable<T> {
        return from(this.getAsync(key));
    }

    public async getAsync<T>(key: string): Promise<T> {
        const content = await this._localStorage.read(key);
        if (!content) {
            return {} as any;
        }

        try {
            const json = JSON.parse(content);
            return json;
        } catch (e) {
            log.error("Loading file from storage has invalid json", { key, content });
            return {} as any;
        }
    }

    /**
     * Store the given data into the given file.
     * @param filename Key to store the data(Corespond to a file under userdata)
     * @param data Javascript object(JSON format) to store
     * @returns observable that will resolve if saving is sucessfull or reject if any error
     */
    public set<T>(key: string, data: T): Observable<{}> {
        return from(this._localStorage.set(key, data));

    }

    public read(key: string): Observable<string> {
        return from(this._localStorage.read(key));
    }

    public write(key: string, content: string): Observable<string> {
        return from(this._localStorage.write(key, content));
    }
}
