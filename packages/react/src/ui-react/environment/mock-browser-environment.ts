import { MockEnvironment } from "@batch/ui-common/lib/environment";
import { initializeIcons } from "@fluentui/react/lib/Icons";

/**
 * Mock environment for a browser-based application
 */
export class MockBrowserEnvironment extends MockEnvironment {
    async beforeInit(): Promise<void> {
        super.beforeInit();
        initializeIcons();
    }
}
