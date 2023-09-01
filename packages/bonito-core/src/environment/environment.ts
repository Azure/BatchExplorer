import { Clock } from "../datetime/clock";
import { HttpClient } from "../http";
import { Localizer } from "../localization";
import { LocationService } from "../location";
import type { Logger, LoggerFactory, LoggingContext } from "../logging";
import { ResourceGroupService } from "../resource-group";
import { StorageAccountService } from "../storage";
import { SubscriptionService } from "../subscription";
import { Notifier } from "../notification";

/**
 * Represents the execution environment of the application. Acts as a
 * container for dependency injection
 */
export interface Environment<C extends EnvironmentConfig> {
    /**
     * The name of the execution environment
     */
    name: EnvironmentName;

    /**
     * Environment configuration that is set one time
     */
    config: C;

    /**
     * True if this environment has been initialized, false otherwise.
     *
     * Note that `initialized = true` does not mean that initialization
     * has finished, only that it has been started.
     */
    readonly initialized: boolean;

    /**
     * Gets the currently configured clock
     */
    getClock(): Clock;

    /**
     * Gets the logger for the current environment
     */
    getLogger(context: string | LoggingContext): Logger;

    /**
     * Gets the localizer for the current environment
     */
    getLocalizer(): Localizer;

    /**
     * Gets the HTTP client for the current environment
     */
    getHttpClient<T extends HttpClient>(): T;

    /**
     * Returns a unique (for this environment), auto-incremented ID number
     */
    uniqueId(): number;

    /**
     * Gets an injectable dependency from the DI container
     */
    getInjectable<T>(id: string): T;

    /**
     * Called once when the application is ready to initialize the environment
     */
    init(): Promise<void>;

    /**
     * Hook that runs at the start of the init() function
     */
    beforeInit(): Promise<void>;

    /**
     * Check if destroy() has been called
     */
    isDestroyed(): boolean;

    /**
     * Hook that runs at the start of the destroy() function
     */
    beforeDestroy(): void;

    /**
     * Perform any necessary teardown. Can be called successively
     * without erroring (subsequent calls to destroy() are no-ops)
     */
    destroy(): void;
}

export enum DependencyName {
    Clock = "clock",
    HttpClient = "httpClient",
    Localizer = "localizer",
    LocationService = "locationService",
    LoggerFactory = "loggerFactory",
    Notifier = "notifier",
    ResourceGroupService = "resourceGroupService",
    StorageAccountService = "storageAccountService",
    SubscriptionService = "subscriptionService",
}

/**
 * An map of factory functions which resolve to dependencies. Properties should
 * be defined as strings in the DependencyName enum.
 */
export interface DependencyFactories {
    [DependencyName.Clock]: () => Clock;
    [DependencyName.HttpClient]: () => HttpClient;
    [DependencyName.LocationService]: () => LocationService;
    [DependencyName.LoggerFactory]: () => LoggerFactory;
    [DependencyName.Localizer]: () => Localizer;
    [DependencyName.Notifier]: () => Notifier;
    [DependencyName.ResourceGroupService]: () => ResourceGroupService;
    [DependencyName.StorageAccountService]: () => StorageAccountService;
    [DependencyName.SubscriptionService]: () => SubscriptionService;
}

/**
 * Base interface for configuration of an environment.
 */
export interface EnvironmentConfig {
    /**
     * Is this running in development or production mode?
     */
    mode: EnvironmentMode;

    /**
     * The base URL of Azure Resource Manager in the current
     * cloud environment.
     */
    armUrl: string;

    /**
     * Environment variables when running in a Node.js process
     */
    envVars?: Record<string, string | undefined>;
}

export enum EnvironmentMode {
    Development = "dev",
    Production = "prod",
}

export enum EnvironmentName {
    Mock = "mock",
    Common = "common",
    Browser = "browser",
}
