import { Injectable } from "@angular/core";
import * as storage from "electron-json-storage";
import { AsyncSubject, Observable } from "rxjs";

@Injectable()
export class LocalFileStorage {
    public get<T>(filename: string): Observable<T> {
        const sub = new AsyncSubject();
        storage.get(filename, (error, data) => {
            this._errorToSub(sub, error, data);
        });
        return sub;
    }

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
