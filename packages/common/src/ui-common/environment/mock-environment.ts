import { DependencyFactories } from ".";
import { setLocalTimeZoneOffset } from "../datetime";
import { FakeClock } from "../datetime/fake-clock";
import { MockHttpClient } from "../http/mock-http-client";
import { StandardLocalizer } from "../localization/standard-localizer";
import { createMockLogger } from "../logging";
import { AbstractEnvironment } from "./abstract-environment";
import {
    EnvironmentName,
    EnvironmentConfig,
    EnvironmentMode,
} from "./environment";

export const mockEnvironmentConfig: EnvironmentConfig = {
    mode: EnvironmentMode.Development,
};

export const mockDependencyFactories: DependencyFactories = {
    clock: () => new FakeClock(),
    loggerFactory: () => createMockLogger,
    localizer: () => new StandardLocalizer(),
    httpClient: () => new MockHttpClient(),
};

export class MockEnvironment<
    C extends EnvironmentConfig
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
