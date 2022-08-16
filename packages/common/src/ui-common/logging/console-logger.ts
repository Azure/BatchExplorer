/* eslint-disable no-console */
import { AbstractLogger } from "./abstract-logger";
import { LogLevel } from "./logger";

export class ConsoleLogger extends AbstractLogger {
    protected _log(level: LogLevel, message: string, ...args: unknown[]): void {
        switch (level) {
            case "debug":
                console.debug(message, args);
                break;
            case "warn":
                console.warn(message, args);
                break;
            case "error":
                console.error(message, args);
                break;
            case "info":
            default:
                console.info(message, args);
        }
    }
}
