import { Injectable } from "@angular/core";
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
    // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
    public Menu: typeof Electron.Menu;
    // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
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

    public async send(eventName: string, data?: any) {
        return this.ipc.send(eventName, data);
    }

    public getCurrentWindow(): any {
        return this._remote.getCurrentWindow();
    }
}
