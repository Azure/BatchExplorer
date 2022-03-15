import {
    DependencyFactories,
    getMockEnvironment,
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig,
} from "@batch/ui-common/lib/environment";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { BrowserEnvironmentConfig } from ".";
import { DefaultParameterTypeResolver } from "../components/form";
import { DefaultFormLayoutProvider } from "../components/form/form-layout";
import { BrowserDependencyFactories } from "./browser-environment";
import { MockBrowserEnvironment } from "./mock-browser-environment";

let _fluentIconsInitialized = false;

export const mockBrowserDepFactories: Partial<BrowserDependencyFactories> = {
    parameterTypeResolver: () => {
        return new DefaultParameterTypeResolver();
    },
    formLayoutProvider: () => {
        return new DefaultFormLayoutProvider();
    },
};

/**
 * Initialize a global mock browser environment.
 */
export function initMockBrowserEnvironment(
    configOverrides: Partial<BrowserEnvironmentConfig> = {},
    depFactoryOverrides: Partial<DependencyFactories> = {}
): void {
    const config = { ...mockEnvironmentConfig, ...configOverrides };
    const depFactories = {
        ...mockDependencyFactories,
        ...mockBrowserDepFactories,
        ...depFactoryOverrides,
    };
    initEnvironment(new MockBrowserEnvironment(config, depFactories));
}

/**
 * Gets the current global mock browser environment if one is initialized.
 * Throws an error if there is no environment, or if the current
 * environment is not a mock browser environment.
 */
export function getMockBrowserEnvironment(): MockBrowserEnvironment {
    const env = getMockEnvironment() as MockBrowserEnvironment;
    if (!env.isMockBrowserEnvironment) {
        throw new Error(
            "Current environment is not a mock browser environment"
        );
    }
    return env;
}

/**
 * Initializes FluentUI icons, but only if they have not been initialized
 * previously.
 */
export function initFluentIcons(): void {
    if (!_fluentIconsInitialized) {
        initializeIcons();
        _fluentIconsInitialized = true;
    }
}
