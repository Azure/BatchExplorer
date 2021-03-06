import { MockEnvironment } from "@batch/ui-common/lib/environment";
import { BrowserEnvironmentConfig } from "./browser-environment";
import { initFluentIcons } from "./environment-util";

/**
 * Mock environment for a browser-based application
 */
export class MockBrowserEnvironment extends MockEnvironment<BrowserEnvironmentConfig> {
    isMockBrowserEnvironment: boolean = true;

    async beforeInit(): Promise<void> {
        super.beforeInit();
        initFluentIcons();

        // If enableA11yTesting hasn't been explicitly set, see if it has
        // been configured via environment variable
        if (this.config.enableA11yTesting == null) {
            if (this.config.envVars?.BE_ENABLE_A11Y_TESTING === "true") {
                this.config.enableA11yTesting = true;
            }
        }
    }
}
