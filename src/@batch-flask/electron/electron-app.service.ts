import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ElectronApp {
    public _app: import("electron").App;
    public require: (module: string) => any;

    constructor() {
        if (process && process.type === "renderer") {
            this._app = require("electron").remote.app;
            this.require = require("electron").remote.require;
        } else {
            this._app = require("electron").app;
            this.require = require;
        }

    }

    public getPath(name: string): string {
        return this._app.getPath(name);
    }
}
