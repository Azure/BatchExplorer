import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { enterZone } from "@batch-flask/core";
import { EventEmitter } from "events";
import { Observable, Subject, fromEvent } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { willUnload } from "./utils";

/**
 * Internal events used by the ipc promise utility to be able to use promise
 */
// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
export const IpcPromiseEvent = {
    request: "ipc-promise-request",
    successSuffix: "-success",
    failureSuffix: "-failure",
    responseSuccess: "ipc-promise-response-success",
    responseFailure: "ipc-promise-response-failure",
};

/**
 * Wrapper around electron ipcRenderer
 */
@Injectable({ providedIn: "root" })
export class IpcService implements OnDestroy {
    private _ipcRenderer: Electron.IpcRenderer;
    private _destroy = new Subject();

    constructor(private zone: NgZone) {
        this._ipcRenderer = require("electron").ipcRenderer;
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.unsubscribe();
    }

    public async sendEvent(eventName: string, data?: any) {
        this._ipcRenderer.send(eventName, data);
    }

    public on<T = any>(eventName: string): Observable<[EventEmitter, T]> {
        return fromEvent(this._ipcRenderer, eventName).pipe(
            takeUntil(this._destroy),
            takeUntil(willUnload),
            enterZone(this.zone),
        ) as any;

    }

    /**
     * Similar to electron sendSync but this one is asynchronus and return a promise.
     * IMPORTANT: To use in the main service use BlIpcMain class intead of the electron ipcMain object.
     *
     * @param eventName event name of common event emitter on main process.
     * @param data data for send.
     * @return promise.
     */
    public async send(eventName: string, data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            const onSuccess = (event, params) => {
                if (params.id !== id || params.eventName !== eventName) {
                    return;
                }
                // remove this listener.
                this._ipcRenderer.removeListener(IpcPromiseEvent.responseSuccess, onSuccess);
                this._ipcRenderer.removeListener(IpcPromiseEvent.responseFailure, onFailure);

                resolve(params.data);
            };
            const onFailure = (event, params) => {
                if (params.id !== id || params.eventName !== eventName) {
                    return;
                }

                // remove this listener.
                this._ipcRenderer.removeListener(IpcPromiseEvent.responseSuccess, onSuccess);
                this._ipcRenderer.removeListener(IpcPromiseEvent.responseFailure, onFailure);

                reject(params.data);
            };

            // add listener to ipc for renderer process.
            this._ipcRenderer.on(IpcPromiseEvent.responseSuccess, onSuccess);
            this._ipcRenderer.on(IpcPromiseEvent.responseFailure, onFailure);

            // send to ipc for main process.
            this._ipcRenderer.send(IpcPromiseEvent.request, {
                data,
                eventName,
                id,
            });
        });
    }
}
