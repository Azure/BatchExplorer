import { Injectable } from "@angular/core";
import { AccountResource } from "app/models";
import { Constants, SecureUtils, log } from "app/utils";
import { AsyncSubject, Observable, Subject } from "rxjs";
import { AccountService } from "../account.service";
import { AdalService } from "../adal";

export interface JsonRpcRequest {
    jsonrpc: string;
    id: string;
    method: string;
    params: any[];
    options: RequestOptions;
}

export interface JsonRpcError {
    code: string;
    message: string;
    data: string;
}

export interface JsonRpcResponse {
    jsonrpc: string;
    id: string;
    result: any;
    stream: boolean;
    error: JsonRpcError;
}

interface RequestContainer {
    request: JsonRpcRequest;
    subject: Subject<any>;

    /**
     * setTimeout id to clear the request if it timeout
     */
    timeout: any;
}

interface RequestOptions {
    authentication?: any;
}
// TODO: comment out unused for now.
// const requestTimeout = 10000;

const ResourceUrl = Constants.ResourceUrl;

@Injectable()
export class PythonRpcService {
    private _socket: WebSocket;
    private _ready = new AsyncSubject();
    private _currentRequests: StringMap<RequestContainer> = {};

    constructor(private accountService: AccountService, private adalService: AdalService) { }
    /**
     * Initialize the connection to the rpc server
     */
    public init() {
        this.resetConnection();
    }

    /**
     * Connect to the rpc server using websocket.
     * Call this if the connection got cut to try again.
     */
    public resetConnection() {
        this._ready = new AsyncSubject();
        this._currentRequests = {};
        const socket = this._socket = new WebSocket("ws://127.0.0.1:8765/ws");

        socket.onopen = (event: Event) => {
            this._ready.next(true);
            this._ready.complete();
        };

        socket.onmessage = (event: MessageEvent) => {
            const response = JSON.parse(event.data);
            this._processResponse(response);
        };
    }

    /**
     * Call a procedure on the python.
     * @param method Name of the method registered in the python
     * @param params Params for the method
     */
    public call(method: string, params: any[], options: RequestOptions = {}): Observable<any> {
        const request = this._buildRequest(method, params, options);
        const container = this._registerRequest(request);

        this._ready.subscribe(() => {
            this._socket.send(JSON.stringify(request));
        });

        return container.subject.asObservable();
    }

    public callWithAuth(method: string, params: any[]): Observable<any> {
        return this.accountService.currentAccount.flatMap((account: AccountResource) => {
            const batchToken = this.adalService.accessTokenFor(account.subscription.tenantId, ResourceUrl.batch);
            const armToken = this.adalService.accessTokenFor(account.subscription.tenantId, ResourceUrl.arm);
            return Observable.combineLatest(batchToken, armToken).flatMap(([batchToken, armToken]) => {
                const authParam = { batchToken, armToken, account: account.toJS() };
                return this.call(method, params, {
                    authentication: authParam,
                });
            });
        }).share();
    }

    /**
     * Build the JsonRpcRequest from the procedure name and parameters.
     * @param method Name of the procedure in the python controller
     * @param params Params for the procedure
     */
    private _buildRequest(method: string, params: any[], options: RequestOptions): JsonRpcRequest {
        return {
            jsonrpc: "2.0",
            id: SecureUtils.uuid(),
            method,
            params,
            options,
        };
    }

    /**
     * Register the request as a pending request.
     * @param request Request to be sent to the rpc server
     */
    private _registerRequest(request: JsonRpcRequest): RequestContainer {
        const container = this._currentRequests[request.id] = {
            request,
            subject: new Subject(),
            timeout: null,
        };

        return container;
    }

    /**
     * Process the response returned by the rpc server.
     * It will find the corresponding request and notify the caller of the outcome.
     * @param response Response returned by the rpc server
     */
    private _processResponse(response: JsonRpcResponse) {
        const request = this._getRequestForResponse(response);
        if (!request) {
            return;
        }
        if (response.error) {
            request.subject.error(response.error);
        } else {
            request.subject.next(response.result);
        }
        if (!response.stream) {
            request.subject.complete();
            delete this._currentRequests[response.id];
        }
    }

    /**
     * Get the request container created for the requestId. If there is any errors it will log and return null.
     * @param response Response returned by the server
     */
    private _getRequestForResponse(response: JsonRpcResponse): RequestContainer {
        const requestId = response.id;
        if (!requestId) {
            log.error("Invalid message sent by the rpc server", response);
            return null;
        }
        const request = this._currentRequests[requestId];
        if (!request) {
            log.error(`Request with id ${requestId} doesn't exists. Maybe it timed out!`, response);
            return null;
        }
        if (!response.result && !response.error) {
            log.error(`Response should have either result or error but none were provided`,
                { response, request: request.request });
            return null;
        }

        return request;
    }
}
