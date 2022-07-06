import {
    DependencyFactories,
    DependencyName,
    getMockEnvironment,
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig,
} from "@batch/ui-common/lib/environment";
import {
    FakeLocationService,
    FakeResourceGroupService,
    FakeStorageAccountService,
    FakeSubscriptionService,
} from "@batch/ui-service";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { BrowserEnvironmentConfig } from ".";
import {
    DefaultFormLayoutProvider,
    DefaultParameterTypeResolver,
} from "../components/form";
import { BrowserDependencyFactories } from "./browser-environment";
import { MockBrowserEnvironment } from "./mock-browser-environment";

let _fluentIconsInitialized = false;

export const mockBrowserDepFactories: Partial<BrowserDependencyFactories> = {
    parameterTypeResolver: () => new DefaultParameterTypeResolver(),
    formLayoutProvider: () => new DefaultFormLayoutProvider(),
    [DependencyName.StorageAccountService]: () =>
        new FakeStorageAccountService(),
    [DependencyName.SubscriptionService]: () => new FakeSubscriptionService(),
    [DependencyName.ResourceGroupService]: () => new FakeResourceGroupService(),
    [DependencyName.LocationService]: () => new FakeLocationService(),
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
