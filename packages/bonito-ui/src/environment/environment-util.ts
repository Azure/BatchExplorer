import {
    FakeLocationService,
    FakeResourceGroupService,
    FakeStorageAccountService,
    FakeSubscriptionService,
} from "@azure/bonito-core";
import {
    DependencyName,
    getMockEnvironment,
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig,
} from "@azure/bonito-core/lib/environment";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { BrowserEnvironmentConfig } from ".";
import {
    DefaultFormControlResolver,
    DefaultFormLayoutProvider,
} from "../components/form";
import {
    BrowserDependencyFactories,
    BrowserDependencyName,
} from "./browser-dependencies";
import { MockBrowserEnvironment } from "./mock-browser-environment";

let _fluentIconsInitialized = false;

export const mockBrowserDepFactories: Partial<BrowserDependencyFactories> = {
    [BrowserDependencyName.FormControlResolver]: () =>
        new DefaultFormControlResolver(),
    [BrowserDependencyName.FormLayoutProvider]: () =>
        new DefaultFormLayoutProvider(),
    [DependencyName.LocationService]: () => new FakeLocationService(),
    [DependencyName.ResourceGroupService]: () => new FakeResourceGroupService(),
    [DependencyName.StorageAccountService]: () =>
        new FakeStorageAccountService(),
    [DependencyName.SubscriptionService]: () => new FakeSubscriptionService(),
};

/**
 * Initialize a global mock browser environment.
 */
export function initMockBrowserEnvironment(
    configOverrides: Partial<BrowserEnvironmentConfig> = {},
    depFactoryOverrides: Partial<BrowserDependencyFactories> = {}
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
export function initFluentIcons(baseUrl?: string): void {
    if (!_fluentIconsInitialized) {
        initializeIcons(baseUrl);
        _fluentIconsInitialized = true;
    }
}
