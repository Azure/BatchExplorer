import { Injectable } from "@angular/core";
import * as path from "path";
import { Observable } from "rxjs";

import { log } from "app/utils";
import { FileSystemService } from "./fs.service";

/**
 * This service is used to read/write files to the user data folder.
 * Prefer this for writing big data over localStorage.
 * Each key is a different file under userData.
 */
@Injectable()
export class LocalFileStorage {

    constructor(private fs: FileSystemService) { }
    /**
     * @param key Key where the data is store
     * @returns Observable which will resolve the data contained in the file if successfull or reject if any error
     */
    public get<T>(key: string): Observable<T> {
        return this.read(key).map((content) => {
            if (!content) {
                return {};
            }

            try {
                return JSON.parse(content);
            } catch (e) {
                log.error("Loading file from storage has invalid json", { key, content });
                return {};
            }
        });
    }

    /**
     * Store the given data into the given file.
     * @param filename Key to store the data(Corespond to a file under userdata)
     * @param data Javascript object(JSON format) to store
     * @returns observable that will resolve if saving is sucessfull or reject if any error
     */
    public set<T>(key: string, data: T): Observable<{}> {
        const content = JSON.stringify(data);
        return this.write(key, content);
    }

    public read(key: string): Observable<string> {
        return Observable.fromPromise(this.fs.readFile(this._getFile(key)).catch(() => null));
    }

    public write(key: string, content: string): Observable<string> {
        return Observable.fromPromise(this.fs.saveFile(this._getFile(key), content));
    }

    private _getFile(key: string) {
        const filename = key.endsWith(".json") ? key : `${key}.json`;
        return path.join(this.fs.commonFolders.userData, filename);
    }
}
