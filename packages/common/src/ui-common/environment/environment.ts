import { HttpClient } from "../http";
import type { Logger } from "../logging";

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
     * Gets the logger for the current environment
     */
    getLogger(): Logger;

    /**
     * Gets the logger for the current environment
     */
    getHttpClient(): HttpClient;

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
    Logger = "logger",
    HttpClient = "httpClient",
    StorageAccountService = "storageAccount",
    SubscriptionService = "subscription",
}

/**
 * An map of factory functions which resolve to dependencies. Properties should
 * be defined as strings in the DependencyName enum.
 */
export interface DependencyFactories {
    [DependencyName.Logger]: () => Logger;
    [DependencyName.HttpClient]: () => HttpClient;
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