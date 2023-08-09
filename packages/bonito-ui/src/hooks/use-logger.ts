import * as React from "react";
import {
    getLogger,
    Logger,
    LoggingContext,
} from "@azure/bonito-core/lib/logging";

/**
 * Hook which gets a logger. Will return the same logger instance as
 * long as the context stays the same. Note that context equality is
 * a reference check.
 *
 * @param context The logger context. Usually should be a string
 *                identifying the component by name.
 *
 * @returns A logger instance
 */
export function useLogger(context: string | LoggingContext): Logger {
    return React.useMemo(() => {
        return getLogger(context);
    }, [context]);
}
