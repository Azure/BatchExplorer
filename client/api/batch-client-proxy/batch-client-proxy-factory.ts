import * as batch from "azure-batch";
import * as msRest from "ms-rest";

import { BatchClientProxy } from "./batch-client-proxy";

export interface SharedKeyOptions {
    account: string;
    key: string;
    url: string;
}

export class BatchClientProxyFactory {

    // For AAD
    private _currentUrl: string = null;
    private _currentToken: string = null;
    private _currentAADClient: BatchClientProxy = null;

    // For shared key
    private _currentSharedKeyOptions: SharedKeyOptions = {} as any;
    private _currentSharedKeyClient: BatchClientProxy = null;


    public getForAADToken(accountUrl: string, token: string): BatchClientProxy {
        console.log("Banana", accountUrl, token);
        if (!token) {
            throw "BatchClientProxy AAD token cannot be null or undefined";
        }
        if (token !== this._currentToken || accountUrl !== this._currentUrl) {
            this._currentToken = token;
            this._currentUrl = accountUrl;
            this._currentAADClient = new BatchClientProxy(accountUrl, this._newAADCredenials(token));
        }
        return this._currentAADClient;
    }

    public getForSharedKey(options: SharedKeyOptions) {
        if (!(this._currentSharedKeyClient
            && options.account === this._currentSharedKeyOptions.account
            && options.url === this._currentSharedKeyOptions.url
            && options.key === this._currentSharedKeyOptions.key)) {
            this._currentSharedKeyOptions = options;
            const credentials = new batch.SharedKeyCredentials(options.account, options.key);
            this._currentSharedKeyClient = new BatchClientProxy(options.account, credentials);
        }
        return this._currentSharedKeyClient;
    }

    private _newAADCredenials(token) {
        return new msRest.TokenCredentials(token, "Bearer");
    }
}
