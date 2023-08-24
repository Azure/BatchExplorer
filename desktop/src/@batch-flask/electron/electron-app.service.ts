import { Injectable } from "@angular/core";
import { App, app } from "electron";

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
        } else {
            this._app = app;
            this.require = require;
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
