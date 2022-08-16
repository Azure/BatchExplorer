import { Logger, LogLevel } from "./logger";

export abstract class AbstractLogger implements Logger {
    info(message: string, ...args: unknown[]): void {
        this._log("info", message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        this._log("debug", message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this._log("warn", message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        this._log("error", message, ...args);
    }

    protected abstract _log(
        level: LogLevel,
        message: string,
        ...args: unknown[]
    ): void;
}
