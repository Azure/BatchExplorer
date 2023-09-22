import { getEnvironment } from "../environment";
import { Notifier } from "./notifier";

/**
 * Gets the notifier for the current environment
 *
 * @returns The globally-configured notifier instance
 */
export function getNotifier(): Notifier {
    return getEnvironment().getNotifier();
}
