import { getEnvironment } from "../environment";
import { CacheManager } from "./cache-manager";

/**
 * Gets the cache manager for the current environment
 *
 * @returns The globally-configured cache manager instance
 */
export function getCacheManager(): CacheManager {
    return getEnvironment().getCacheManager();
}
