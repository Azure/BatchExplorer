import { BehaviorSubject, Observable } from "rxjs";

export interface CommonListOptions {
    filter?: string;
    select?: string;
    maxResults?: number;
}

export class ServiceBase {
    private _defaultPageSize: number = 25;
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public get maxResults(): number {
        return this._defaultPageSize;
    }

    public get loading(): Observable<boolean> {
        return this._loading.asObservable();
    }

    public setLoadingState(loading: boolean) {
        this._loading.next(loading);
    }

    protected callBatchClient(promise: any, errorCallback: (error: any) => void): Observable<any> {
        const observable = Observable.fromPromise<any>(promise);
        observable.subscribe({
            error: (error) => {
                errorCallback(error);
            },
        });

        return observable;
    }
}
