import {
    DependencyFactories,
    DependencyName,
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig
} from "@batch/ui-common/lib/environment";
import {
    BrowserEnvironmentConfig,
    MockBrowserEnvironment,
    mockBrowserDepFactories
} from "@batch/ui-react/lib/environment";
import { FakeDesktopLocalizer } from "app/localizer/fake-desktop-localizer";

/**
 * Initialize a global mock desktop environment.
 */
export function initMockDesktopEnvironment(
    configOverrides: Partial<BrowserEnvironmentConfig> = {},
    depFactoryOverrides: Partial<DependencyFactories> = {}
): void {
    const config = { ...mockEnvironmentConfig, ...configOverrides };

    // Customizations for the mock desktop environment
    const mockDesktopDepFactories = {
        [DependencyName.Localizer]: () => new FakeDesktopLocalizer()
    };

    const depFactories = {
        ...mockDependencyFactories,
        ...mockBrowserDepFactories,
        ...mockDesktopDepFactories,
        ...depFactoryOverrides,
    };
    initEnvironment(new MockBrowserEnvironment(config, depFactories));
}
