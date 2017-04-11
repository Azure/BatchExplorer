import { Injectable } from "@angular/core";
import * as storage from "electron-json-storage";
import { AsyncSubject, Observable } from "rxjs";

/**
 * This service is used to read/write files to the user data folder.
 * Prefer this for writing big data over localStorage.
 */
@Injectable()
export class LocalFileStorage {
    /**
     * @param filename Name of the file
     * @returns Observable which will resolve the data contained in the file if successfull or reject if any error
     */
    public get<T>(filename: string): Observable<T> {
        const sub = new AsyncSubject();
        storage.get(filename, (error, data) => {
            this._errorToSub(sub, error, data);
        });
        return sub;
    }

    /**
     * Store the given data into the given file.
     * @param filename Filename to store the data
     * @param data Javascript object(JSON format) to store
     * @returns observable that will resolve if saving is sucessfull or reject if any error
     */
    public set<T>(filename: string, data: T): Observable<{}> {
        const sub = new AsyncSubject();
        storage.set(filename, data, (error) => {
            this._errorToSub(sub, error);
        });
        return sub;
    }

    private _errorToSub(subject: AsyncSubject<any>, error: any, data?: any) {
        if (error) {
            subject.error(error);
        } else {
            if (data) {
                subject.next(data);
            }
            subject.complete();
        }
    }
}
