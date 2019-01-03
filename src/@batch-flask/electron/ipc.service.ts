import { Injectable } from "@angular/core";

/**
 * Internal events used by the ipc promise utility to be able to use promise
 */
// tslint:disable-next-line:variable-name
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
@Injectable({providedIn: "root"})
export class IpcService {
    private _ipcRenderer: Electron.IpcRenderer;
    constructor() {
        this._ipcRenderer = require("electron").ipcRenderer;
    }

    public async sendEvent(eventName: string, data?: any) {
        this._ipcRenderer.send(eventName, data);
    }

    public async on(eventName: string, callback: (...args) => void) {
        this._ipcRenderer.on(eventName, callback);
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
