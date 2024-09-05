import { Injectable } from "@angular/core";
import { App, app } from "electron";

declare global {
    const  __non_webpack_require__: typeof require;
}

@Injectable({ providedIn: "root" })
export class ElectronApp {
    public _app: App;
    public require: (module: string) => any;

    private _remote;

    constructor() {
        if (process && process.type === "renderer") {
            this._remote = require("@electron/remote");
            this._app = this._remote.app;
            this.require = this._remote.require;
            console.log("ElectronApp: ", this._remote, this._remote.require);
        } else {
            this._app = app;
            this.require = __non_webpack_require__ ;
        }

    }

    public getPath(name:
        'home' | 'appData' | 'userData' | 'sessionData' |
        'temp' | 'exe' | 'module' | 'desktop' | 'documents' |
        'downloads' | 'music' | 'pictures' | 'videos' |
        'recent' | 'logs' | 'crashDumps'): string {
        return this._app.getPath(name);
    }
}
