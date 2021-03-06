import { getEnvironment } from "../environment";
import type { Logger } from "./logger";

/**
 * Gets the logger for the current environment
 *
 * @returns A logger object
 */
export function getLogger(): Logger {
    return getEnvironment().getLogger();
}
