import { Logger } from "./base-logger";
// tslint:disable:no-console

/**
 * Logger helper class that will log
 */
export class RendererLogger implements Logger {
    private _ipcRenderer: import("electron").IpcRenderer;
    constructor() {
        this._ipcRenderer = require("electron").ipcRenderer;
    }

    public log(level: string, message: string, ...params: any[]) {
        this._ipcRenderer.send("SEND_LOG", { level, message, params });
    }

    public debug(message: string, ...params: any[]) {
        console.debug(message);
        this.log("debug", message, ...params);
    }

    public info(message: string, ...params: any[]) {
        console.log(message);
        this.log("info", message, ...params);
    }

    public warn(message: string, ...params: any[]) {
        console.warn(message, params);
        this.log("warn", message, ...params);
    }

    public error(message: string, error?: any) {
        console.error(message, error);
        this.log("error", message, error);
    }
}
