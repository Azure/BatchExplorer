import { Injectable } from "@angular/core";
import { AccountResource } from "app/models";
import { Constants, SecureUtils, log } from "app/utils";
import { AsyncSubject, Observable } from "rxjs";
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
    error: JsonRpcError;
}

interface RequestContainer {
    request: JsonRpcRequest;
    subject: AsyncSubject<any>;

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
            // TODO remove
            // this._socket.send(`{"jsonrpc":"2.0","id":"087e1e66-4254-43e1-a692-8894cbc3f847","method":"create_file_group","params":["teste","D:/dev/js/run-in-the-cloud/test/**/*",null],"options":{"authentication":{"batchToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlZXVkljMVdEMVRrc2JiMzAxc2FzTTVrT3E1USIsImtpZCI6IlZXVkljMVdEMVRrc2JiMzAxc2FzTTVrT3E1USJ9.eyJhdWQiOiJodHRwczovL2JhdGNoLmNvcmUud2luZG93cy5uZXQvIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3LyIsImlhdCI6MTUwMTAxMjM5MSwibmJmIjoxNTAxMDEyMzkxLCJleHAiOjE1MDEwMTYyOTEsIl9jbGFpbV9uYW1lcyI6eyJncm91cHMiOiJzcmMxIn0sIl9jbGFpbV9zb3VyY2VzIjp7InNyYzEiOnsiZW5kcG9pbnQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0LzcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0Ny91c2Vycy84YTBiZjYyYy0zNjI5LTQ2MTktYWJkNC04YzIyNTdmMjgyYmUvZ2V0TWVtYmVyT2JqZWN0cyJ9fSwiYWNyIjoiMSIsImFpbyI6IkFTUUEyLzhEQUFBQVhITzhWMmdSaytGUzVNLzE4MjJKa2hFMC94MnQ5ZkthSEdhSTV3QVQ2VVU9IiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBpZCI6IjA0YjA3Nzk1LThkZGItNDYxYS1iYmVlLTAyZjllMWJmN2I0NiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiR3VlcmluIiwiZ2l2ZW5fbmFtZSI6IlRpbW90aGVlIiwiaXBhZGRyIjoiMTMxLjEwNy4xNzQuNDIiLCJuYW1lIjoiVGltb3RoZWUgR3VlcmluIiwib2lkIjoiOGEwYmY2MmMtMzYyOS00NjE5LWFiZDQtOGMyMjU3ZjI4MmJlIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTEyNDUyNTA5NS03MDgyNTk2MzctMTU0MzExOTAyMS0xNTcwMjA4IiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMwMDAwOTQxQTM2NTciLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJXbWhrTzJGclRfVy12QWtITjdwOTBkUzQ2QV9iVDdqclBUTml1d2RadzZrIiwidGlkIjoiNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3IiwidW5pcXVlX25hbWUiOiJ0aWd1ZXJpbkBtaWNyb3NvZnQuY29tIiwidXBuIjoidGlndWVyaW5AbWljcm9zb2Z0LmNvbSIsInZlciI6IjEuMCJ9.AX-4bzk_6zccZ_zJaFXQFZ4BF2jfN3uAFzGZEoLUqhQFR-Qj-CTFA9f59HuCvhyHeGDi0mdTS5Sy9JPdDfIG-8DPtiOrHj417uM7rM2OUkaJsrQaWP42h88lredPFDxlToNuDHfKjPNc-IR09vEfeKjia1BIwC8UsyH9TPKM7eLatN9MUmF9b_PiGaw2sg8CU7JYUNPMMH_a1N3Z0VaiTRKq1BCLT6mqObWphaxX1pUtv-JLp7OprW2zOOCMaG6rDt_N82tUiPvi-MBPGrX4BozMho_ljclMwAkLseYZlMEFHErtxaa8TB649tAL8MLqvHnlEFMvvf11YL3Farmngw","armToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlZXVkljMVdEMVRrc2JiMzAxc2FzTTVrT3E1USIsImtpZCI6IlZXVkljMVdEMVRrc2JiMzAxc2FzTTVrT3E1USJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNTAxMDEyMzg5LCJuYmYiOjE1MDEwMTIzODksImV4cCI6MTUwMTAxNjI4OSwiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzLzhhMGJmNjJjLTM2MjktNDYxOS1hYmQ0LThjMjI1N2YyODJiZS9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiQVNRQTIvOERBQUFBdXU3MlgzSHpKU1Qya3dUY3I2V3ZVeXBCTEZQVkg3K0NTVE9EbC9sWnc2QT0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiMDRiMDc3OTUtOGRkYi00NjFhLWJiZWUtMDJmOWUxYmY3YjQ2IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJHdWVyaW4iLCJnaXZlbl9uYW1lIjoiVGltb3RoZWUiLCJpcGFkZHIiOiIxMzEuMTA3LjE3NC40MiIsIm5hbWUiOiJUaW1vdGhlZSBHdWVyaW4iLCJvaWQiOiI4YTBiZjYyYy0zNjI5LTQ2MTktYWJkNC04YzIyNTdmMjgyYmUiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMTI0NTI1MDk1LTcwODI1OTYzNy0xNTQzMTE5MDIxLTE1NzAyMDgiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzAwMDA5NDFBMzY1NyIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6Ii0xRzNWS3FXU05XWnc4eXZBdUhkam9rRUtpUEVsYW52SkI3Ym81SDBGVjgiLCJ0aWQiOiI3MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDciLCJ1bmlxdWVfbmFtZSI6InRpZ3VlcmluQG1pY3Jvc29mdC5jb20iLCJ1cG4iOiJ0aWd1ZXJpbkBtaWNyb3NvZnQuY29tIiwidmVyIjoiMS4wIn0.lTExmhlKeDoClSn-dV5nbAJqdyHuKfynPs0WnWPbuiFlfd-8Gc4YWLJv__nAqXFcb2KFrjDt1IZuq8w7ihqlP84NQqDaNGJwQ-Hu6QyL9FzY2mf8fLTXnSaRD9Y8TPHss-lCDSCvBEvArDVVy5XyozgcR6RPfTe6pu7vbee5IzYmM_c7Nqwbx0o25NuVWZS0F0eeZ8ij4ifXB2ygFyEOxNLqujB2smkt6VYRkwFniuRT4rtTvSLTSNg-yD7XyhIyQlU2hqVQMFjSmPb73-IGoOHoBla10ZgD_Y4rXWiFdi3wtxuMs5xkswqL2okp7wR1kjxYYtuec72qR2VIdom4gA","account":{"type":"Microsoft.Batch/batchAccounts","id":"/subscriptions/21abd678-18c5-4660-9fdd-8c5ba6b6fe1f/resourcegroups/default-azurebatch-brazilsouth/providers/microsoft.batch/batchaccounts/prodtest1","name":"prodtest1","location":"brazilsouth","properties":{"accountEndpoint":"prodtest1.brazilsouth.batch.azure.com","provisioningState":"Succeeded","dedicatedCoreQuota":21,"lowPriorityCoreQuota":20,"poolQuota":25,"activeJobAndJobScheduleQuota":50,"autoStorage":{"storageAccountId":"/subscriptions/21abd678-18c5-4660-9fdd-8c5ba6b6fe1f/resourceGroups/default-azurebatch-brazilsouth/providers/Microsoft.Storage/storageAccounts/batchapppackage","lastKeySync":"2017-07-22T23:00:04.168Z"},"poolAllocationMode":"batchservice"},"subscription":{"id":"/subscriptions/21abd678-18c5-4660-9fdd-8c5ba6b6fe1f","subscriptionId":"21abd678-18c5-4660-9fdd-8c5ba6b6fe1f","tenantId":"72f988bf-86f1-41af-91ab-2d7cd011db47","displayName":"Batch-paselem","state":"Enabled"}}}}}`);
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
        return this.accountService.currentAccount.cascade((account: AccountResource) => {
            const batchToken = this.adalService.accessTokenFor(account.subscription.tenantId, ResourceUrl.batch);
            const armToken = this.adalService.accessTokenFor(account.subscription.tenantId, ResourceUrl.arm);
            return Observable.combineLatest(batchToken, armToken).cascade(([batchToken, armToken]) => {
                const authParam = { batchToken, armToken, account: account.toJS() };
                this.call(method, params, {
                    authentication: authParam,
                });
            });
        });
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
            subject: new AsyncSubject(),
            timeout: null /*setTimeout(() => {
                this._timeoutRequest(request.id);
            }, requestTimeout)*/,
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
            request.subject.complete();
        }
        delete this._currentRequests[response.id];
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

    // TODO: As per Tim's suggestion, commented out for now so no timeouts.
    /**
     * Remove the request from the list of pending request and log a timeout.
     * @param requestId Id of the request
     */
    // private _timeoutRequest(requestId: string) {
    //     const request = this._currentRequests[requestId];
    //     if (!request) {
    //         return;
    //     }
    //     delete this._currentRequests[requestId];

    //     request.subject.error({
    //         code: 408,
    //         message: `Rpc request timeout after ${requestTimeout}ms`,
    //     });
    // }
}
