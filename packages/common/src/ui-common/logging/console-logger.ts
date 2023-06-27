/* eslint-disable no-console */
import { AbstractLogger } from "./abstract-logger";
import { LoggerFactory, LoggingContext, LogLevel } from "./logger";
import { formatTextLogMessage } from "./logging-util";

export class ConsoleLogger extends AbstractLogger {
    protected _log(
        level: LogLevel,
        message: string,
        context: LoggingContext,
        ...args: unknown[]
    ): void {
        const params = args.length === 0 ? undefined : args;
        switch (level) {
            case "debug":
                console.debug(formatTextLogMessage(message, context), params);
                break;
            case "warn":
                console.warn(formatTextLogMessage(message, context), params);
                break;
            case "error":
                console.error(formatTextLogMessage(message, context), params);
                break;
            case "info":
            default:
                console.info(formatTextLogMessage(message, context), params);
        }
    }
}

export const createConsoleLogger: LoggerFactory = (
    context: string | LoggingContext
) => {
    return new ConsoleLogger(context);
};
