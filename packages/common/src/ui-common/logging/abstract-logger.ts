import { Logger, LogLevel } from "./logger";

export abstract class AbstractLogger implements Logger {
    info(message: string): void {
        this._log("info", message);
    }

    debug(message: string): void {
        this._log("debug", message);
    }

    warn(message: string): void {
        this._log("warn", message);
    }

    error(message: string): void;
    error<T extends Error>(message: string, error: T): void;
    error(message: string, error?: unknown): void {
        this._log("error", message, error);
    }

    protected abstract _log(level: LogLevel, message: string): void;
    protected abstract _log<T extends Error>(
        level: LogLevel,
        message: string,
        error: T
    ): void;
    protected abstract _log(
        level: LogLevel,
        message: string,
        error: unknown
    ): void;
}
