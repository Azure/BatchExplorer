import {
    AbstractEnvironment,
    DependencyFactories,
    EnvironmentConfig,
    EnvironmentName,
} from "@batch/ui-common/lib/environment";
import { initializeIcons } from "@fluentui/react/lib/Icons";

/**
 * Environment for a browser-based application
 */
export class BrowserEnvironment extends AbstractEnvironment<
    EnvironmentConfig,
    DependencyFactories
> {
    name = EnvironmentName.Browser;

    async beforeInit(): Promise<void> {
        initializeIcons();
    }

    async beforeDestroy(): Promise<void> {
        // No-op
    }
}
