import {
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig,
} from "@azure/bonito-core/lib/environment";
import {
    BrowserDependencyName,
    BrowserEnvironmentConfig,
    MockBrowserEnvironment,
    mockBrowserDepFactories,
} from "@azure/bonito-ui/lib/environment";
import { mockBatchDepFactories } from "@batch/ui-service/lib/environment";
import { BatchFormControlResolver } from "../form";
import { BatchBrowserDependencyFactories } from "./batch-browser-dependencies";

export const mockBatchBrowserDepFactories: Partial<BatchBrowserDependencyFactories> =
    {
        ...mockBatchDepFactories,
        ...mockBrowserDepFactories,
        [BrowserDependencyName.FormControlResolver]: () =>
            new BatchFormControlResolver(),
    };

/**
 * Initialize a global mock Batch browser environment.
 */
export function initMockBatchBrowserEnvironment(
    configOverrides: Partial<BrowserEnvironmentConfig> = {},
    depFactoryOverrides: Partial<BatchBrowserDependencyFactories> = {}
): void {
    const config = { ...mockEnvironmentConfig, ...configOverrides };
    const depFactories = {
        ...mockDependencyFactories,
        ...mockBatchBrowserDepFactories,
        ...depFactoryOverrides,
    };
    initEnvironment(new MockBrowserEnvironment(config, depFactories));
}
