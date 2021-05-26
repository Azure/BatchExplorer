import {
    AbstractEnvironment,
    DependencyFactories,
    EnvironmentConfig,
    EnvironmentName,
} from "@batch/ui-common/lib/environment";
import { initializeIcons } from "@fluentui/react/lib/Icons";

// Prevent icons from being initialized more than once globally
let iconsInitialized = false;

/**
 * Environment for a browser-based application
 */
export class BrowserEnvironment extends AbstractEnvironment<
    EnvironmentConfig,
    DependencyFactories
> {
    name = EnvironmentName.Browser;

    async beforeInit(): Promise<void> {
        if (!iconsInitialized) {
            initializeIcons();
            iconsInitialized = true;
        }
    }

    async beforeDestroy(): Promise<void> {
        // No-op
    }
}
