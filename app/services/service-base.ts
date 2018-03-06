import { BehaviorSubject, Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { BatchClientService } from "./";

export class ServiceBase {
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public get loading(): Observable<boolean> {
        return this._loading.asObservable();
    }

    constructor(
        protected batchService?: BatchClientService) { }

    public setLoadingState(loading: boolean) {
        this._loading.next(loading);
    }

    /**
     * Helper function to call an action on the batch client library.
     * This will handle converting the Batch error to a ServerError.
     * @param promise Promise returned by the batch client
     * @param  errorCallback Optional error callback if want to log
     */
    protected callBatchClient<T>(
        promise: (client: any) => Promise<any>,
        errorCallback?: (error: any) => void): Observable<T> {

        if (!this.batchService) {
            throw new Error("batchService not set in ServiceBase");
        }

        return this.batchService.get().flatMap((client) => {
            return Observable.fromPromise<T>(promise(client)).catch((err) => {
                const serverError = ServerError.fromBatch(err);
                if (errorCallback) {
                    errorCallback(serverError);
                }

                return Observable.throw(serverError);
            });
        }).share();
    }
}
