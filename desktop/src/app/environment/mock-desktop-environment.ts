import {
    DependencyName,
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig
} from "@azure/bonito-core/lib/environment";
import { BrowserEnvironmentConfig, MockBrowserEnvironment } from "@azure/bonito-ui/lib/environment";
import {
    BatchBrowserDependencyFactories,
    mockBatchBrowserDepFactories,
} from "@batch/ui-react/lib/environment";
import { FakeDesktopLocalizer } from "app/localizer/fake-desktop-localizer";

/**
 * Initialize a global mock desktop environment.
 */
export function initMockDesktopEnvironment(
    configOverrides: Partial<BrowserEnvironmentConfig> = {},
    depFactoryOverrides: Partial<BatchBrowserDependencyFactories> = {}
): void {
    const config = { ...mockEnvironmentConfig, ...configOverrides };

    // Customizations for the mock desktop environment
    const mockDesktopDepFactories = {
        [DependencyName.Localizer]: () => new FakeDesktopLocalizer()
    };

    const depFactories = {
        ...mockDependencyFactories,
        ...mockBatchBrowserDepFactories,
        ...mockDesktopDepFactories,
        ...depFactoryOverrides,
    };
    initEnvironment(new MockBrowserEnvironment(config, depFactories));
}
