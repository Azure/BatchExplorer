import { Logger } from "./base-logger";
// tslint:disable:no-console

/**
 * Logger helper class that will log
 */
export class RendererLogger implements Logger {
    private _logger: any;
    constructor() {
        this._logger = (require("electron").remote.getCurrentWindow() as any).logger;
        if (!this._logger) {
            this._logger = {
                error: () => null,
                log: () => null,
                warn: () => null,
                info: () => null,
            };
        }
    }

    public debug(message: string, ...params: any[]) {
        console.debug(message);
        this._logger.debug(message, ...params);
    }

    public info(message: string, ...params: any[]) {
        console.log(message);
        this._logger.info(message, ...params);
    }

    public warn(message: string, ...params: any[]) {
        console.warn(message, params);
        this._logger.warn(message, ...params);
    }

    public error(message: string, error?: any) {
        console.error(message, error);
        this._logger.error({ err: error }, message);
    }
}
