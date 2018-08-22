import { Injectable, NgZone } from "@angular/core";
import { AsyncSubject, BehaviorSubject, Observable, Subject } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { ElectronRemote } from "@batch-flask/ui";
import { AccountResource } from "app/models";
import { JsonRpcRequest, JsonRpcResponse, RequestContainer, RequestOptions } from "app/models/python-rpc";
import { BatchExplorerService } from "app/services/batch-labs.service";
import { SecureUtils, log } from "app/utils";
import { PythonRpcServerProcess } from "client/python-process";
import { AccountService } from "../account.service";
import { AdalService } from "../adal";

@Injectable()
export class PythonRpcService {
    public connected: Observable<boolean>;
    private _socket: WebSocket;
    private _ready = new AsyncSubject();
    private _currentRequests: StringMap<RequestContainer> = {};
    private _retryCount = 0;
    private _connected = new BehaviorSubject<boolean>(false);
    private _serverProcess: PythonRpcServerProcess;

    constructor(
        remote: ElectronRemote,
        private accountService: AccountService,
        private adalService: AdalService,
        private _zone: NgZone,
        private batchExplorer: BatchExplorerService,
    ) {
        this._serverProcess = batchExplorer.pythonServer;
        this.connected = this._connected.asObservable();
    }
    /**
     * Initialize the connection to the rpc server
     */
    public init() {
        this.resetConnection();
    }

    public async startServer() {
        await this._serverProcess.start();
        this.resetConnection();
    }

    public stopServer() {
        this._serverProcess.stop();
    }

    public async restartServer() {
        await this._serverProcess.restart();
        this.resetConnection();
    }

    /**
     * Connect to the rpc server using websocket.
     * Call this if the connection got cut to try again.
     */
    public resetConnection(): Observable<any> {
        this._serverProcess.port.then((port) => {
            this._ready = new AsyncSubject<any>();
            const socket = this._socket = new WebSocket(`ws://127.0.0.1:${port}/ws`);
            socket.onopen = (event: Event) => {
                this._connected.next(true);
                if (this._retryCount > 0) {
                    log.info("Reconnected to websocket successfully.");
                }
                this._retryCount = 0;
                this._zone.run(() => {
                    this._ready.next(true);
                    this._ready.complete();
                });
            };

            socket.onerror = (error: Event) => {
                this._connected.next(false);
                this._zone.run(() => {
                    this._ready.error(event);
                });
            };

            socket.onclose = () => {
                this._connected.next(false);
                const waitingTime = Math.floor(2 ** this._retryCount);
                this._retryCount++;
                log.info(`Websocket connection closed. Retrying to connect in ${waitingTime}s`);
                setTimeout(() => {
                    this.resetConnection();
                }, waitingTime * 1000);
            };

            socket.onmessage = (event: MessageEvent) => {
                this._zone.run(() => {
                    const response = JSON.parse(event.data);
                    this._processResponse(response);
                });
            };
        });

        return this._ready.asObservable();
    }

    /**
     * Call a procedure on the python.
     * @param method Name of the method registered in the python
     * @param params Params for the method
     */
    public call(method: string, params: any[], options: RequestOptions = {}): Observable<any> {
        const request = this._buildRequest(method, params, options);
        const container = this._registerRequest(request);

        this._ready.catch(() => {
            return this.resetConnection(); // Tries once to reset the connection right away.
        }).subscribe({
            next: () => {
                this._socket.send(JSON.stringify(request));
            },
            error: (error) => {
                container.subject.next(error);
            },
        });

        return container.subject.asObservable();
    }

    public callWithAuth(method: string, params: any[]): Observable<any> {
        const resourceUrl = this.batchExplorer.azureEnvironment;
        return this.accountService.currentAccount.first().flatMap((account: AccountResource) => {
            const batchToken = this.adalService.accessTokenFor(account.subscription.tenantId, resourceUrl.batchUrl);
            const armToken = this.adalService.accessTokenFor(account.subscription.tenantId, resourceUrl.armUrl);
            return Observable.combineLatest(batchToken, armToken).first().flatMap(([batchToken, armToken]) => {
                const authParam = { batchToken, armToken, armUrl: resourceUrl.armUrl, account: account.toJS() };
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
            request.subject.error(ServerError.fromPython(response.error));
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
            if (!response.stream) {
                log.error(`Request with id ${requestId} doesn't exists. Maybe it timed out!`, response);
            }
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
