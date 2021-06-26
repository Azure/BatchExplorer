import { DependencyFactories } from ".";
import type { Logger } from "../logging";
import { DiContainer } from "./di-container";
import {
    DependencyName,
    Environment,
    EnvironmentConfig,
    EnvironmentMode,
    EnvironmentName,
} from "./environment";

/**
 * Abstract base class for shared functionality across different environments
 */
export abstract class AbstractEnvironment<
    C extends EnvironmentConfig,
    D extends DependencyFactories
> implements Environment<C>
{
    abstract readonly name: EnvironmentName;
    readonly mode: EnvironmentMode;

    private _diContainer: DiContainer<D>;

    /**
     * Get an instance of the global logger
     */
    getLogger(): Logger {
        const logger = this.getInjectable<Logger>(DependencyName.Logger);
        if (!logger) {
            throw new Error("No logger configured for the current environment");
        }
        return logger;
    }

    protected _globalIdCounter: number = 0;

    private _config: C;
    get config(): C {
        return this._config;
    }

    private _destroyed: boolean = false;

    constructor(config: C, dependencyMap: D) {
        this._config = config;
        this.mode = config.mode ?? EnvironmentMode.Development;
        this._diContainer = new DiContainer(dependencyMap);
    }

    /**
     * Gets a singleton instance of the requested dependency
     *
     * @param dependencyName The unique name of the dependency
     *
     * @returns An instantiated dependency
     */
    getInjectable<T>(dependencyName: string): T {
        return this._diContainer.get(dependencyName) as T;
    }

    /**
     * Runs when the environment is initialized for the first time
     */
    abstract beforeInit(): Promise<void>;

    /**
     * Runs when destroy() is called. Note: Will not be called if the environment
     * has already been destroyed.
     */
    abstract beforeDestroy(): Promise<void>;

    async init(): Promise<void> {
        this._assertNotDestroyed();
        this.beforeInit();
    }

    /**
     * Generates an ID unique to this environment
     *
     * @returns A numeric ID
     */
    uniqueId(): number {
        this._assertNotDestroyed();
        return this._globalIdCounter++;
    }

    /**
     * Performs any manual destruction needed for this environment. Can be
     * called safely without checking if the environment has already been
     * destroyed.
     */
    destroy(): void {
        if (this._destroyed) {
            return;
        }
        this.beforeDestroy();
        this._destroyed = true;
    }

    isDestroyed(): boolean {
        return this._destroyed;
    }

    /**
     * Should be called from every function except isDestroyed() to make sure
     * we're not accidentally referencing old environments.
     */
    protected _assertNotDestroyed(): void {
        if (!this._destroyed) {
            return;
        }
        throw new Error("Environment has already been destroyed");
    }
}
