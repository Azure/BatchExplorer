import * as msRest from "ms-rest-js";

import { BatchClientProxy } from "./batch-client-proxy";

export interface SharedKeyOptions {
    account: string;
    key: string;
    url: string;
}

/**
 * Factory class that return the batch client proxy built for the given credentials.
 * It prevent from recreating a new client everytime we do a new request
 * as it will cache the last AAD and last shared key client
 */
export class BatchClientProxyFactory {

    // For AAD
    private _currentUrl: string = null;
    private _currentToken: string = null;
    private _currentAADClient: BatchClientProxy = null;

    // For shared key
    private _currentSharedKeyOptions: SharedKeyOptions = {} as any;
    private _currentSharedKeyClient: BatchClientProxy = null;

    /**
     * Return the client for AAD usage
     * @param accountUrl Url endpoint
     * @param token AAD access token
     */
    public getForAADToken(accountUrl: string, token: string): BatchClientProxy {
        if (!token) {
            throw new Error("BatchClientProxy AAD token cannot be null or undefined");
        }
        if (token !== this._currentToken || accountUrl !== this._currentUrl) {
            this._currentToken = token;
            this._currentUrl = accountUrl;
            this._currentAADClient = new BatchClientProxy(this._newAADCredenials(token), accountUrl);
        }
        return this._currentAADClient;
    }

    public getForSharedKey(options: SharedKeyOptions) {
        if (!(this._currentSharedKeyClient
            && options.account === this._currentSharedKeyOptions.account
            && options.url === this._currentSharedKeyOptions.url
            && options.key === this._currentSharedKeyOptions.key)) {
            this._currentSharedKeyOptions = options;
            // const credentials = new batch.SharedKeyCredentials(options.account, options.key);
            // this._currentSharedKeyClient = new BatchClientProxy(options.account, credentials);
        }
        return this._currentSharedKeyClient;
    }

    private _newAADCredenials(token) {
        return new msRest.TokenCredentials(token, "Bearer");
    }
}
