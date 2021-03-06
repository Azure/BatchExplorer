import { Injectable } from "@angular/core";
import { App, app, remote } from "electron";

@Injectable({ providedIn: "root" })
export class ElectronApp {
    public _app: App;
    public require: (module: string) => any;

    constructor() {
        if (process && process.type === "renderer") {
            this._app = remote.app;
            this.require = remote.require;
        } else {
            this._app = app;
            this.require = require;
        }

    }

    public getPath(name:
        "home" | "appData" | "userData" | "cache" | "temp" | "exe" |
        "module" | "desktop" | "documents" | "downloads" | "music" |
        "pictures" | "videos" | "logs" | "pepperFlashSystemPlugin"): string {
        return this._app.getPath(name);
    }
}
