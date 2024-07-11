import { DependencyFactories } from ".";
import { setLocalTimeZoneOffset } from "../datetime";
import { FakeClock } from "../datetime/fake-clock";
import { MockHttpClient } from "../http/mock-http-client";
import { FakeLocalizer } from "../localization/fake-localizer";
import { FakeLocationService } from "../location";
import { createMockLogger } from "../logging";
import { FakeResourceGroupService } from "../resource-group";
import { FakeStorageAccountService } from "../storage";
import { FakeSubscriptionService } from "../subscription";
import { AbstractEnvironment } from "./abstract-environment";
import {
    EnvironmentName,
    EnvironmentConfig,
    EnvironmentMode,
} from "./environment";
import { FakeNotifier } from "../notification/fake-notifier";
import { MemoryCacheManager } from "../cache";

export const mockEnvironmentConfig: EnvironmentConfig = {
    mode: EnvironmentMode.Development,
    armUrl: "https://management.azure.com",
};

export const mockDependencyFactories: DependencyFactories = {
    clock: () => new FakeClock(),
    httpClient: () => new MockHttpClient(),
    localizer: () => new FakeLocalizer(),
    locationService: () => new FakeLocationService(),
    loggerFactory: () => createMockLogger,
    resourceGroupService: () => new FakeResourceGroupService(),
    storageAccountService: () => new FakeStorageAccountService(),
    subscriptionService: () => new FakeSubscriptionService(),
    notifier: () => new FakeNotifier(),
    cacheManager: () => new MemoryCacheManager(),
};

export class MockEnvironment<
    C extends EnvironmentConfig,
> extends AbstractEnvironment<C, DependencyFactories> {
    name = EnvironmentName.Mock;

    constructor(config: C, depFactories?: DependencyFactories) {
        super(config, depFactories ?? mockDependencyFactories);
    }

    async beforeInit(): Promise<void> {
        // Hard-coded timezone offset for unit testing
        setLocalTimeZoneOffset(-3);
    }

    async beforeDestroy(): Promise<void> {
        // Reset to the system time zone
        setLocalTimeZoneOffset(null);
    }

    /**
     * Reset any mutable environment state to ease unit test writing
     */
    reset(): void {
        this._assertNotDestroyed();
        this.resetGlobalIdCounter();
    }

    /**
     * Resets the global ID counter back to zero
     */
    private resetGlobalIdCounter(): void {
        this._assertNotDestroyed();
        this._globalIdCounter = 0;
    }
}
