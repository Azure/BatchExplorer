import { Injectable } from "@angular/core";
import { BatchLabsApplication, FileSystem, LocalFileStorage } from "client/core";
import { AuthenticationWindow } from "client/core/aad";
import { SplashScreen } from "client/splash-screen";
import { IpcService } from "./ipc.service";

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
    // tslint:disable-next-line:variable-name
    public Menu: typeof Electron.Menu;
    // tslint:disable-next-line:variable-name
    public MenuItem: typeof Electron.MenuItem;

    public _remote: Electron.Remote;
    constructor(private ipc: IpcService) {
        this._remote = require("electron").remote;
        this.Menu = this._remote.Menu;
        this.MenuItem = this._remote.MenuItem;
    }

    public get dialog(): Electron.Dialog {
        return this._remote.dialog;
    }

    public get electronApp(): Electron.App {
        return this._remote.app;
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
        return this._remote.getCurrentWindow();
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

    public async send(eventName: string, data?: any) {
        return this.ipc.send(eventName, data);
    }

    private _currentWindow(): any {
        return this._remote.getCurrentWindow();
    }
}
