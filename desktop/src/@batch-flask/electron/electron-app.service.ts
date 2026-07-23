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
            // Use the real Node require (not webpack's) so dynamic runtime lookups like
            // app.require("fs") / "glob" / "chokidar" resolve. In the bundled main process
            // a plain `require` is webpack's require, which throws MODULE_NOT_FOUND for
            // these (they are intentionally left external). __non_webpack_require__ emits a
            // literal require untouched by the bundler. Falls back to `require` when running
            // unbundled (e.g. ts-node scripts / tests).
            this.require = typeof __non_webpack_require__ !== "undefined" ? __non_webpack_require__ : require;
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
