import { DependencyFactories } from ".";
import { Environment, EnvironmentConfig } from "./environment";
import {
    mockDependencyFactories,
    MockEnvironment,
    mockEnvironmentConfig,
} from "./mock-environment";

let _currentEnvironment: Environment<EnvironmentConfig> | null = null;

/**
 * Gets the current global environment object, or throws an error
 * if none is initialized.
 *
 * @returns The current environment
 */
export function getEnvironment(): Environment<EnvironmentConfig> {
    if (!_currentEnvironment) {
        throw new Error(
            "Unable to get environment: No environment has been initialized"
        );
    }
    return _currentEnvironment;
}

/**
 * Tears down the currently loaded environment
 */
export function destroyEnvironment(): void {
    if (_currentEnvironment) {
        _currentEnvironment.destroy();
    }
    _currentEnvironment = null;
}

/**
 * Gets an injectable dependency from the currently loaded environment
 * given a dependency ID.
 *
 * @returns An injectable object
 */
export function inject<T>(id: string): T {
    return getEnvironment().getInjectable<T>(id);
}

/**
 * Gets the current global mock environment if one is initialized,
 * or throws an error if there is no environment, or if the current
 * environment is not a mock.
 */
export function getMockEnvironment(): MockEnvironment {
    if (!_currentEnvironment) {
        throw new Error(
            "Unable to get mock environment: No environment has been initialized"
        );
    }
    if (_currentEnvironment instanceof MockEnvironment) {
        return _currentEnvironment;
    }
    throw new Error(
        "Unable to get mock environment: The current environment is not a mock environment"
    );
}

/**
 * Initialize a global environment.
 * Note that mock environments may be initialized over and over.
 * Any previous mock environment will be torn down automatically.
 */
export function initEnvironment<T extends Environment<EnvironmentConfig>>(
    env: T
): void {
    if (_currentEnvironment) {
        if (!(_currentEnvironment instanceof MockEnvironment)) {
            throw new Error("Cannot reinitialize a non-mock environment");
        } else if (!(env instanceof MockEnvironment)) {
            throw new Error(
                "Cannot initialize non-mock environments when a mock environment is already initialized"
            );
        }
        _currentEnvironment.destroy();
    }
    _currentEnvironment = env;
    _currentEnvironment.init();
}

/**
 * Initialize a global mock environment. Allows overriding specific config
 * values or dependencies
 */
export function initMockEnvironment(
    configOverrides: Partial<EnvironmentConfig> = {},
    depFactoryOverrides: Partial<DependencyFactories> = {}
): void {
    const config = { ...mockEnvironmentConfig, ...configOverrides };
    const depFactories = {
        ...mockDependencyFactories,
        ...depFactoryOverrides,
    };
    initEnvironment(new MockEnvironment(config, depFactories));
}
