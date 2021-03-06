import {
    AbstractEnvironment,
    DependencyFactories,
    EnvironmentConfig,
    EnvironmentName,
} from "@batch/ui-common/lib/environment";
import { initFluentIcons } from "./environment-util";

export interface BrowserEnvironmentConfig extends EnvironmentConfig {
    enableA11yTesting?: boolean;
}

/**
 * Environment for a browser-based application
 */
export class BrowserEnvironment extends AbstractEnvironment<
    BrowserEnvironmentConfig,
    DependencyFactories
> {
    name = EnvironmentName.Browser;

    async beforeInit(): Promise<void> {
        initFluentIcons();
    }

    async beforeDestroy(): Promise<void> {
        // No-op
    }
}
