import { LogLevel, Logger } from "../base-logger";

/**
 * Basic logger to be used in the browser in the website version
 */
export class BrowserLogger implements Logger {
    public log(level: LogLevel, message: string, ...params: any[]) {
        console[level](message, ...params);
    }

    public debug(message: string, ...params: any[]) {
        this.log("debug", message, ...params);
    }

    public info(message: string, ...params: any[]) {
        this.log("info", message, ...params);
    }

    public warn(message: string, ...params: any[]) {
        this.log("warn", message, ...params);
    }

    public error(message: string, error?: any) {
        this.log("error", message, error);
    }
}

/**
 * Logger instance that will be used inside Electron Renderer
 * This is the same as the Browser logger but also send the logs to the main process to be saved to file
 */
export class RendererLogger extends BrowserLogger implements Logger {
    private _ipcRenderer: import("electron").IpcRenderer;
    constructor() {
        super();
        this._ipcRenderer = require("electron").ipcRenderer;
    }

    public log(level: LogLevel, message: string, ...params: any[]) {
        super.log(level, message, ...params);
        this._ipcRenderer.send("SEND_LOG", { level, message, params });
    }
}
