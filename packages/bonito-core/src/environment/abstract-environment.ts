import { DependencyFactories } from ".";
import { Localizer } from "../localization";
import { HttpClient } from "../http";
import type { Logger, LoggerFactory, LoggingContext } from "../logging";
import { DiContainer } from "./di-container";
import {
    DependencyName,
    Environment,
    EnvironmentConfig,
    EnvironmentMode,
    EnvironmentName,
} from "./environment";
import { Clock } from "../datetime/clock";
import { Notifier } from "../notification";

/**
 * Abstract base class for shared functionality across different environments
 */
export abstract class AbstractEnvironment<
    C extends EnvironmentConfig = EnvironmentConfig,
    D extends DependencyFactories = DependencyFactories,
> implements Environment<C>
{
    abstract readonly name: EnvironmentName;
    readonly mode: EnvironmentMode;

    private _initialized: boolean = false;

    get initialized(): boolean {
        return this._initialized;
    }

    private _diContainer: DiContainer<D>;

    /**
     * Get the currently configured clock
     */
    getClock(): Clock {
        const clock = this.getInjectable<Clock>(DependencyName.Clock);
        if (!clock) {
            throw new Error("No clock configured for the current environment");
        }
        return clock;
    }

    /**
     * Get an instance of the global logger
     */
    getLogger(context: string | LoggingContext): Logger {
        const createLogger = this.getInjectable<LoggerFactory>(
            DependencyName.LoggerFactory
        );
        if (!createLogger) {
            throw new Error("No logger configured for the current environment");
        }
        return createLogger(context);
    }

    /**
     * Get an instance of the global localizer
     */
    getLocalizer(): Localizer {
        const localizer = this.getInjectable<Localizer>(
            DependencyName.Localizer
        );
        if (!localizer) {
            throw new Error(
                "No localizer configured for the current environment"
            );
        }
        return localizer;
    }

    /**
     * Get an instance of the global notifier
     */
    getNotifier(): Notifier {
        const notifier = this.getInjectable<Notifier>(DependencyName.Notifier);
        if (!notifier) {
            throw new Error(
                "No notifier configured for the current environment"
            );
        }
        return notifier;
    }

    /**
     * Get the currently configured HTTP client
     */
    getHttpClient<T extends HttpClient>(): T {
        const httpClient = this.getInjectable<T>(DependencyName.HttpClient);
        if (!httpClient) {
            throw new Error(
                "No HTTP client configured for the current environment"
            );
        }
        return httpClient;
    }

    protected _globalIdCounter: number = 0;

    private _config: C;
    get config(): C {
        return this._config;
    }

    private _destroyed: boolean = false;

    constructor(config: C, dependencyMap: D) {
        this._config = config;
        if (this._config.envVars == null) {
            // webpack 5 does no longer include a polyfill for this Node.js variable
            this._config.envVars = globalThis?.process?.env ?? {};
        }
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
        this._initialized = true;
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
