import { getEnvironment } from "../environment";
import { CacheManager } from "./cache-manager";

/**
 * Gets the notifier for the current environment
 *
 * @returns The globally-configured notifier instance
 */
export function getCacheManager(): CacheManager {
    return getEnvironment().getCacheManager();
}
