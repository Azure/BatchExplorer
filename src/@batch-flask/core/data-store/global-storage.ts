import { log } from "@batch-flask/utils";
import { Observable } from "rxjs";
import { map, publishReplay, refCount, take } from "rxjs/operators";

/**
 * Low level storage abstraction.
 * To be implemented differently in browser and in electron
 *  - Electron: Use local file
 *  - Browser will user localStorage property
 *
 * It handles synchronization of data across the app. ALl other user of data can receive update when it changes
 * Use localStorage if data shouldn't be shared across processes(Browser windows)
 */
export abstract class GlobalStorage {
    private _parsedObs = new Map<string, Observable<any | null>>();

    /**
     * Save JS object to storage with the given key
     * @param key Storage key
     * @param value Object to store
     */
    public set<T extends {}>(key: string, value: T) {
        const content = JSON.stringify(value);
        return this.save(key, content);
    }

    /**
     * Watch the latest value of  JS object in storage with the given key.
     * Will have null if the data stored is in an invalid state(Invalid JSON)
     * @param key Storage key
     * @param value Object to store
     */
    public watch<T extends {}>(key: string): Observable<T | null> {
        if (this._parsedObs.has(key)) {
            return this._parsedObs.get(key)!;
        }
        const obs = this.watchContent(key).pipe(
            map((content) => {
                if (!content) { return null; }

                try {
                    return JSON.parse(content);
                } catch (e) {
                    log.error("Loading file from storage has invalid json", { key, content });
                    return null;
                }
            }),
            publishReplay(1),
            refCount(),
        );
        obs.subscribe();
        this._parsedObs.set(key, obs);
        return obs;
    }

    /**
     * To get the value once.
     * Prefer using watch when possible.
     * Using get can leads to data invalidation
     * @param key Storage key
     */
    public get<T extends {}>(key: string): Promise<T | null> {
        return this.watch<T>(key).pipe(take(1)).toPromise();
    }
    /**
     * @param key Key of the storage
     * @param content Plain content to store
     */
    public abstract save(key: string, content: string): Promise<void>;

    /**
     * Observable to get the latest plain value of this storage key
     */
    public abstract watchContent(key: string): Observable<string | null>;
}
