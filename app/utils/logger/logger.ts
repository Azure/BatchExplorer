import bunyan from "./bunyan-logger";
// tslint:disable:no-console

/**
 * Logger helper class that will log
 */
export class Logger {
    /**
     * Doesn't not log to the console
     */
    public trace(message: string) {
        console.trace(message);
        bunyan.trace(message);
    }

    public debug(message: string) {
        console.debug(message);
        bunyan.debug(message);
    }

    public info(message: string) {
        console.log(message);
        bunyan.info(message);
    }

    public warn(message: string, params?: any) {
        console.warn(message, params);
        bunyan.warn({ warn: { ...params } }, message);
    }

    public error(message: string, error?: any) {
        console.error(message, error);
        bunyan.error({ err: { ...error } }, message);
    }
}

export const log = new Logger();
