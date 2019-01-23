import { log } from "@batch-flask/utils";
import { Observable } from "rxjs";
import { map, publishReplay, refCount } from "rxjs/operators";

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
    private _parsedObs = new Map<string, Observable<any>>();
    public set<T extends {}>(key: string, value: T) {
        const content = JSON.stringify(value);
        return this.save(key, content);
    }

    public watch<T extends {}>(key: string): Observable<T | null> {
        if (this._parsedObs.has(key)) {
            return this._parsedObs.get(key);
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
        this._parsedObs.set(key, obs);
        return obs;
    }

    public abstract save(key: string, content: string): Promise<void>;
    public abstract watchContent(key: string): Observable<string | null>;
}
