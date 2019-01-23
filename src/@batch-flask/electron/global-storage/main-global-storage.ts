import { Injectable } from "@angular/core";
import { GlobalStorage } from "@batch-flask/core";
import * as path from "path";
import { Observable, Subscriber, from } from "rxjs";
import { publishReplay, refCount } from "rxjs/operators";
import { FileSystemService } from "../fs.service";

@Injectable()
export class MainGlobalStorage extends GlobalStorage {
    private _subscriberMap = new Map<string, Subscriber<any>>();
    private _obs = new Map<string, Observable<string>>();

    constructor(private fs: FileSystemService) {
        super();
    }

    public watchContent(key: string): Observable<string> {
        if (this._obs.has(key)) {
            return this._obs.get(key);
        }
        const obs = new Observable<string>((subscriber) => {
            this._subscriberMap.set(key, subscriber);
            this._readFile(key).subscribe(subscriber);
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

    public async save(key: string, content: string): Promise<void> {
        if (this._subscriberMap.has(key)) {
            this._subscriberMap.get(key).next(content);
        }
        await this.fs.saveFile(this._getFile(key), content);
    }

    private _readFile(key: string): Observable<string | null> {
        return from(this.fs.readFile(this._getFile(key)).catch(() => null));
    }

    private _getFile(key: string) {
        return path.join(this.fs.commonFolders.userData, `${key}.json`);
    }
}
