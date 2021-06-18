import {
    DependencyFactories,
    EnvironmentConfig,
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig,
} from "@batch/ui-common/lib/environment";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { MockBrowserEnvironment } from "./mock-browser-environment";

let _fluentIconsInitialized = false;

/**
 * Initialize a global mock browser environment.
 */
export function initMockBrowserEnvironment(
    configOverrides: Partial<EnvironmentConfig> = {},
    depFactoryOverrides: Partial<DependencyFactories> = {}
): void {
    const config = { ...mockEnvironmentConfig, ...configOverrides };
    const depFactories = {
        ...mockDependencyFactories,
        ...depFactoryOverrides,
    };
    initEnvironment(new MockBrowserEnvironment(config, depFactories));
}

/**
 * Initializes FluentUI icons, but only if they have not been initialized
 * previously.
 */
export function initFluentIcons() {
    if (!_fluentIconsInitialized) {
        initializeIcons();
        _fluentIconsInitialized = true;
    }
}
