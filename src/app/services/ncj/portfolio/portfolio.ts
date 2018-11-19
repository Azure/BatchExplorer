import { FileSystemService, LoadingStatus } from "@batch-flask/ui";
import * as path from "path";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, filter, map, share, switchMap, take, tap } from "rxjs/operators";

export enum PortfolioType {
    Github = "github",
    Folder = "folder",

}

export interface PortfolioReference {
    id: string;
    type: PortfolioType;
    source: string;
}

export abstract class Portfolio {
    public id: string;
    public type: PortfolioType;
    public source: string;
    public loadingStatus: Observable<LoadingStatus>;

    protected _loadingStatus = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);

    /**
     * Local path to the root of the data
     */
    protected abstract path: string;

    constructor(public reference: PortfolioReference, protected fs: FileSystemService) {
        this.id = reference.id;
        this.type = reference.type;
        this.source = reference.source;

        this._cacheData().subscribe();
    }

    public refresh() {
        return this._cacheData(true);
    }

    public get ready(): Observable<this> {
        return this._loadingStatus.pipe(
            filter(x => x === LoadingStatus.Ready),
            take(1),
            map(_ => this),
        );
    }

    public getPath(uri: string): string {
        return path.join(this.path, uri);
    }

    protected abstract cache(): Observable<any>;
    protected abstract isReloadNeeded(): Observable<boolean>;

    private _cacheData(forceRefresh = false) {
        this._loadingStatus.next(LoadingStatus.Loading);

        return of(null).pipe(
            switchMap(_ => {
                if (forceRefresh) {
                    return of(true);
                } else {
                    return this.isReloadNeeded();
                }
            }),
            switchMap((needReload) => {
                if (needReload) {
                    return this.cache();
                } else {
                    return of(null);
                }
            }),
            tap(_ => this._loadingStatus.next(LoadingStatus.Ready)),
            catchError((e) => {
                this._loadingStatus.next(LoadingStatus.Error);
                return of(e);
            }),
            share(),
        );
    }
}
