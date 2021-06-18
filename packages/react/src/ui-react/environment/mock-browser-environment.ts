import { MockEnvironment } from "@batch/ui-common/lib/environment";
import { initFluentIcons } from "./environment-util";

/**
 * Mock environment for a browser-based application
 */
export class MockBrowserEnvironment extends MockEnvironment {
    async beforeInit(): Promise<void> {
        super.beforeInit();
        initFluentIcons();
    }
}
