import { FakeClock } from "../../datetime/fake-clock";
import { MockHttpClient } from "../../http";
import { FakeLocalizer } from "../../localization/fake-localizer";
import { FakeLocationService } from "../../location";
import { createMockLogger } from "../../logging";
import { FakeResourceGroupService } from "../../resource-group";
import { FakeStorageAccountService } from "../../storage";
import { FakeSubscriptionService } from "../../subscription";
import { AlertNotifier } from "../../notification/alert-notifier";
import { AbstractEnvironment } from "../abstract-environment";
import {
    DependencyFactories,
    EnvironmentConfig,
    EnvironmentMode,
    EnvironmentName,
} from "../environment";
import {
    destroyEnvironment,
    getEnvironment,
    getMockEnvironment,
    initEnvironment,
    initMockEnvironment,
    inject,
} from "../environment-util";
import { mockDependencyFactories } from "../mock-environment";

describe("Environment tests", () => {
    interface FakeBrowserEnvironmentConfig extends EnvironmentConfig {
        browserName?: string;
    }

    class FakeBrowserEnvironment extends AbstractEnvironment<
        FakeBrowserEnvironmentConfig,
        DependencyFactories
    > {
        name = EnvironmentName.Browser;

        async beforeInit(): Promise<void> {
            // No-op
        }

        async beforeDestroy(): Promise<void> {
            // No-op
        }
    }

    const cfg: FakeBrowserEnvironmentConfig = {
        mode: EnvironmentMode.Development,
        armUrl: "https://management.contoso.com",
        browserName: "Internet Explorer MSDOS Edition",
    };

    test("getEnvironment throws an error if no env is loaded", () => {
        expect(() => getEnvironment()).toThrow(
            "Unable to get environment: No environment has been initialized"
        );
    });

    test("When a non-mock environment is loaded, no others may be initialized", async () => {
        const env = new FakeBrowserEnvironment(cfg, mockDependencyFactories);
        expect(env.initialized).toBe(false);
        const initPromise = initEnvironment(env);
        expect(env.initialized).toBe(true);

        await initPromise;

        const browserEnv = getEnvironment() as FakeBrowserEnvironment;
        expect(browserEnv.config.browserName).toBe(
            "Internet Explorer MSDOS Edition"
        );

        expect(() =>
            initEnvironment(
                new FakeBrowserEnvironment(cfg, mockDependencyFactories)
            )
        ).toThrow("Cannot reinitialize a non-mock environment");
        expect(() => initMockEnvironment()).toThrow(
            "Cannot reinitialize a non-mock environment"
        );
    });

    test("Can initialize mock environment many times", () => {
        initMockEnvironment();
        const envOne = getMockEnvironment();
        expect(envOne.initialized).toBe(true);
        expect(envOne.uniqueId()).toEqual(0);
        expect(envOne.uniqueId()).toEqual(1);

        // Initializing a new mock env destroys the old one
        expect(envOne.isDestroyed()).toBe(false);
        initMockEnvironment();
        expect(envOne.isDestroyed()).toBe(true);

        // New environment has a new global ID counter
        const envTwo = getEnvironment();
        expect(envTwo.uniqueId()).toEqual(0);
        expect(envTwo.uniqueId()).toEqual(1);

        // Cannot initialize a non-mock environment over a mock one
        expect(() =>
            initEnvironment(
                new FakeBrowserEnvironment(cfg, mockDependencyFactories)
            )
        ).toThrow(
            "Cannot initialize non-mock environments when a mock environment is already initialized"
        );
    });

    test("Loading different environments injects different dependencies", () => {
        // Dog goes woof
        initEnvironment(new DogEnvironment(cfg));
        expect(new Room().listen()).toEqual("You hear 'Woof!'");

        destroyEnvironment();

        // Cat goes meow
        initEnvironment(new CatEnvironment(cfg));
        expect(new Room().listen()).toEqual("You hear 'Meow!'");
    });

    interface Animal {
        speak(): string;
    }

    class Dog implements Animal {
        speak() {
            return "Woof!";
        }
    }

    class Cat implements Animal {
        speak() {
            return "Meow!";
        }
    }

    class Room {
        animal: Animal = inject("animal");

        listen(): string {
            return `You hear '${this.animal.speak()}'`;
        }
    }

    interface AnimalDependencyFactories extends DependencyFactories {
        animal: () => Animal;
    }

    class DogEnvironment extends AbstractEnvironment<
        EnvironmentConfig,
        AnimalDependencyFactories
    > {
        name = EnvironmentName.Browser;

        constructor(config: EnvironmentConfig) {
            super(config, {
                animal: () => new Dog(),
                clock: () => new FakeClock(),
                httpClient: () => new MockHttpClient(),
                locationService: () => new FakeLocationService(),
                loggerFactory: () => createMockLogger,
                localizer: () => new FakeLocalizer(),
                notifier: () => new AlertNotifier(),
                resourceGroupService: () => new FakeResourceGroupService(),
                storageAccountService: () => new FakeStorageAccountService(),
                subscriptionService: () => new FakeSubscriptionService(),
            });
        }

        async beforeInit(): Promise<void> {
            // No-op
        }

        async beforeDestroy(): Promise<void> {
            // No-op
        }
    }

    class CatEnvironment extends AbstractEnvironment<
        EnvironmentConfig,
        AnimalDependencyFactories
    > {
        name = EnvironmentName.Browser;

        constructor(config: EnvironmentConfig) {
            super(config, {
                animal: () => new Cat(),
                clock: () => new FakeClock(),
                httpClient: () => new MockHttpClient(),
                locationService: () => new FakeLocationService(),
                loggerFactory: () => createMockLogger,
                localizer: () => new FakeLocalizer(),
                notifier: () => new AlertNotifier(),
                resourceGroupService: () => new FakeResourceGroupService(),
                storageAccountService: () => new FakeStorageAccountService(),
                subscriptionService: () => new FakeSubscriptionService(),
            });
        }

        async beforeInit(): Promise<void> {
            // No-op
        }

        async beforeDestroy(): Promise<void> {
            // No-op
        }
    }
});
