import { Injectable } from "@angular/core";
import { BatchLabsApplication, FileSystem, LocalFileStorage } from "client/core";
import { AuthenticationWindow } from "client/core/aad";
import { SplashScreen } from "client/splash-screen";
import { IpcPromiseEvent } from "common/constants";
import { ipcRenderer, remote } from "electron";

// Uncomment bellow to check sendSync performance issues
// let total = 0;
// const sendSyncOriginal = ipcRenderer.sendSync.bind(ipcRenderer);
// ipcRenderer.sendSync = (channel: string, ...args) => {
//     const start = new Date().getTime();
//     const result = sendSyncOriginal(channel, ...args);
//     const run = new Date().getTime() - start;
//     total += run;
//     console.log("Send sync", channel, total, run);
//     return result;
// };

/**
 * Injectable service wrapping electron shell.
 * This makes it easier to mock the electron shell.
 */
@Injectable()
export class ElectronRemote {

    public get dialog(): Electron.Dialog {
        return remote.dialog;
    }

    public get electronApp(): Electron.App {
        return remote.app;
    }

    /**
     * @returns The BrowserWindow object which this web page belongs to.
     */
    public getBatchLabsApp(): BatchLabsApplication {
        return this._currentWindow().batchLabsApp;
    }

    /**
     * @returns The BrowserWindow object which this web page belongs to.
     */
    public getCurrentWindow(): Electron.BrowserWindow {
        return remote.getCurrentWindow();
    }

    public getSplashScreen(): SplashScreen {
        return this._currentWindow().splashScreen;
    }

    public getAuthenticationWindow(): AuthenticationWindow {
        return this._currentWindow().authenticationWindow;
    }

    public getFileSystem(): FileSystem {
        return this._currentWindow().fs;
    }

    public getLocalFileStorage(): LocalFileStorage {
        return this._currentWindow().localFileStorage;
    }

    /**
     * trigger event.
     *
     * @param eventName event name of common event emitter on main process.
     * @param data data for send.
     * @return promise.
     */
    public send(eventName: string, data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            const onSuccess = (event, params) => {
                if (params.id !== id || params.eventName !== eventName) {
                    return;
                }

                // remove this listener.
                ipcRenderer.removeListener(IpcPromiseEvent.responseSuccess, onSuccess);
                ipcRenderer.removeListener(IpcPromiseEvent.responseFailure, onFailure);

                resolve(params.data);
            };
            const onFailure = (event, params) => {
                if (params.id !== id || params.eventName !== eventName) {
                    return;
                }

                // remove this listener.
                ipcRenderer.removeListener(IpcPromiseEvent.responseSuccess, onSuccess);
                ipcRenderer.removeListener(IpcPromiseEvent.responseFailure, onFailure);

                reject(params.data);
            };

            // add listener to ipc for renderer process.
            ipcRenderer.on(IpcPromiseEvent.responseSuccess, onSuccess);
            ipcRenderer.on(IpcPromiseEvent.responseFailure, onFailure);

            // send to ipc for main process.
            ipcRenderer.send(IpcPromiseEvent.request, {
                data,
                eventName,
                id,
            });
        });
    }

    private _currentWindow(): any {
        return remote.getCurrentWindow();
    }
}
