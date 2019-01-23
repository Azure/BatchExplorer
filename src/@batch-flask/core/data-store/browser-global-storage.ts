import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { publishReplay, refCount } from "rxjs/operators";
import { GlobalStorage } from "./global-storage";

@Injectable()
export class BrowserLocalStorage extends GlobalStorage {
    private _subscriberMap = new Map<string, Subscriber<any>>();
    private _obs = new Map<string, Observable<string>>();

    public async save(key: string, content: string): Promise<void> {
        localStorage.setItem(key, content);
    }

    public async read(key: string): Promise<string | null> {
        return Promise.resolve(localStorage.getItem(key));
    }

    public watchContent(key: string): Observable<string> {
        if (this._obs.has(key)) {
            return this._obs.get(key);
        }
        const obs = new Observable<string>((subscriber) => {
            this._subscriberMap.set(key, subscriber);
            subscriber.next(localStorage.getItem(key));
            return () => {
                this._obs.delete(key);
                this._subscriberMap.delete(key);
            };
        }).pipe(
            publishReplay(1),
            refCount(),
        );
        this._obs.set(key, obs);
        return obs;
    }
}
