/* eslint-disable no-console */
import { AbstractLogger } from "./abstract-logger";
import { LogLevel } from "./logger";

export class ConsoleLogger extends AbstractLogger {
    protected _log(level: LogLevel, message: string): void;
    protected _log<T extends Error>(
        level: LogLevel,
        message: string,
        error: T
    ): void;
    protected _log(level: LogLevel, message: string, error?: unknown): void {
        switch (level) {
            case "debug":
                console.debug(message);
                break;
            case "warn":
                console.warn(message);
                break;
            case "error":
                console.error(message, error);
                break;
            case "info":
            default:
                console.log(message);
        }
    }
}
