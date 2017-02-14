import { BehaviorSubject, Observable } from "rxjs";

import { ServerError } from "app/models";

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

    /**
     * Helper function to call an action on the batch client library.
     * This will handle converting the Batch error to a ServerError.
     * @param promise Promise returned by the batch client
     * @param  errorCallback Optional error callback if want to log
     */
    protected callBatchClient(promise: Promise<any>, errorCallback?: (error: any) => void): Observable<any> {
        const observable = Observable.fromPromise<any>(promise).catch((err) => {
            const serverError = ServerError.fromBatch(err);
            if (errorCallback) {
                errorCallback(serverError);
            }
            return Observable.throw(serverError);
        });

        return observable;
    }
}
