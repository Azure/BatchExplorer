import { Type } from "@angular/core";
import { HttpCode } from "@batch-flask/core/constants";
import { ServerError } from "@batch-flask/core/server-error";
import { exists, log } from "@batch-flask/utils";
import { DataCache } from "./data-cache";

export interface GenericGetterConfig<TEntity, TParams> {
    /**
     *  Method that return the cache given the params.
     * This allow the use of targeted data cache which depends on some params.
     */
    cache: (params: TParams) => DataCache<TEntity>;

    /**
     * List of error code not to log in the console.
     * @default [404]
     */
    logIgnoreError?: number[];

    /**
     * Optional callback for handling any expected errors we may encounter so they
     * don't result in a debug bl-server-error component. This way we can show a custom
     * error message to the user.
     */
    onError?: (error: ServerError) => boolean;
}

export class GenericGetter<TEntity, TParams> {
    protected getCache: (params: TParams) => DataCache<TEntity>;
    private _logIgnoreError: number[];

    constructor(public type: Type<TEntity>, protected config: GenericGetterConfig<TEntity, TParams>) {
        this.getCache = config.cache;
        this._logIgnoreError = exists(config.logIgnoreError) ? config.logIgnoreError : [HttpCode.NotFound];
    }

    protected processError(error: ServerError) {
        // We need to clone the error otherwise it only logs the stacktrace
        // and not the actual error returned by the server which is not helpful
        if (error && error.status && !this._logIgnoreError.includes(error.status)) {
            log.error("Error in RxProxy", Object.assign({}, error));
        }

        // if we dont have a callback, or the rethrow response is true, then handle error os normal
        if (this.config.onError) {
            return this.config.onError(error);
        }
        return error;
    }

    protected _createItem(data: any, params: any): TEntity {
        if (data instanceof this.type) {
            return data;
        } else {
            return new this.type({ ...params as any, ...data });
        }
    }

}
