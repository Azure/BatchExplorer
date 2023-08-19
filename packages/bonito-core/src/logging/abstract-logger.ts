import { cloneDeep } from "lodash";
import { mergeDeep } from "../util";
import {
    Logger,
    LoggingContext,
    LogLevel,
    LogMessageInContext,
} from "./logger";

export abstract class AbstractLogger implements Logger {
    readonly context: LoggingContext;

    /**
     * @param context A context object, or the name of the area to initialize
     *                this logger for.
     */
    constructor(context: string | LoggingContext) {
        if (typeof context === "string") {
            this.context = {
                area: context,
            };
        } else {
            this.context = context;
        }
    }

    info(message: string | LogMessageInContext, ...args: unknown[]): void {
        if (typeof message === "string") {
            this._log("info", message, this.context, ...args);
        } else {
            const result = mergeContext(this.context, message);
            this._log("info", result.message, result.context, ...args);
        }
    }

    debug(message: string | LogMessageInContext, ...args: unknown[]): void {
        if (typeof message === "string") {
            this._log("debug", message, this.context, ...args);
        } else {
            const result = mergeContext(this.context, message);
            this._log("debug", result.message, result.context, ...args);
        }
    }

    warn(message: string | LogMessageInContext, ...args: unknown[]): void {
        if (typeof message === "string") {
            this._log("warn", message, this.context, ...args);
        } else {
            const result = mergeContext(this.context, message);
            this._log("warn", result.message, result.context, ...args);
        }
    }

    error(message: string | LogMessageInContext, ...args: unknown[]): void {
        if (typeof message === "string") {
            this._log("error", message, this.context, ...args);
        } else {
            const result = mergeContext(this.context, message);
            this._log("error", result.message, result.context, ...args);
        }
    }

    protected abstract _log(
        level: LogLevel,
        message: string,
        context: LoggingContext,
        ...args: unknown[]
    ): void;
}

/**
 * Merge main context with message context and return the effective message
 * string and new effective context object.
 */
function mergeContext(
    context: LoggingContext,
    msgInContext: LogMessageInContext
): { message: string; context: LoggingContext } {
    // Make sure we're merging into a copy, not the logger's main context
    const contextCopy = cloneDeep(context);

    // Merge main context with message's context
    const { message, ...msgContext } = msgInContext;
    const mergedContext = mergeDeep(contextCopy, msgContext) as LoggingContext;
    return {
        message: message,
        context: mergedContext,
    };
}
