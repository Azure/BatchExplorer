import { getEnvironment } from "../environment";
import type { Logger, LoggingContext } from "./logger";

/**
 * Gets the logger for the current environment
 *
 * @param context Additional data included in each log message. If this is a
 *                string, it should be a friendly name of the area in which
 *                these log messages occur (class name, UI component name,
 *                blade name, etc.)
 *
 * @returns A logger object configured
 */
export function getLogger(context: string | LoggingContext): Logger {
    return getEnvironment().getLogger(context);
}

/**
 * Format a log message as a string. Used by both ConsoleLogger and MockLogger
 *
 * @param message The message to format
 * @param context The full logging context
 * @returns A formatted log message string
 */
export function formatTextLogMessage(
    message: string,
    context: LoggingContext
): string {
    const instanceSuffix =
        context.instance == null ? "" : ` ${context.instance}`;
    return `[${context.area}${instanceSuffix}] - ${message}`;
}
