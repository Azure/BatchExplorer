import { Injectable } from "@angular/core";
import { IpcService } from "./ipc.service";
import type {
    Menu as RemoteMenu,
    MenuItem as RemoteMenuItem,
    dialog as RemoteDialog,
    app as RemoteApp,
    getCurrentWindow as remoteGetCurrentWindow
} from "@electron/remote";

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

type ElectronRemoteModule = {
    Menu: typeof RemoteMenu,
    MenuItem: typeof RemoteMenuItem,
    dialog: typeof RemoteDialog,
    app: typeof RemoteApp,
    getCurrentWindow: typeof remoteGetCurrentWindow
}

/**
 * Injectable service wrapping electron shell.
 * This makes it easier to mock the electron shell.
 */
@Injectable()
export class ElectronRemote {
    public Menu: typeof Electron.Menu;
    public MenuItem: typeof Electron.MenuItem;

    private _remote: ElectronRemoteModule;

    constructor(private ipc: IpcService) {
        // Require here because importing @electron/remote fails for client
        // unit tests
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        this._remote = require("@electron/remote");

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
