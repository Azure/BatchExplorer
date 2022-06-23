import { Parameter } from "@batch/ui-common";
import {
    AbstractEnvironment,
    DependencyFactories,
    DependencyName,
    Environment,
    EnvironmentConfig,
    EnvironmentName,
    getEnvironment,
} from "@batch/ui-common/lib/environment";
import { FormValues } from "@batch/ui-common/lib/form";
import { StorageAccountService } from "@batch/ui-service";
import {
    FormLayout,
    FormLayoutProvider,
    FormLayoutType,
} from "../components/form/form-layout";
import {
    ParameterTypeResolver,
    FormControlOptions,
} from "../components/form/parameter-type";
import { initFluentIcons } from "./environment-util";
import { MockBrowserEnvironment } from "./mock-browser-environment";

export enum BrowserDependencyName {
    ParameterTypeResolver = "parameterTypeResolver",
    FormLayoutProvider = "formLayoutProvider",
}

export interface BrowserEnvironment
    extends Environment<BrowserEnvironmentConfig> {
    getFormControl<V extends FormValues, K extends Extract<keyof V, string>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions
    ): JSX.Element;

    getFormLayout(layoutType?: FormLayoutType): FormLayout;
}

export interface BrowserEnvironmentConfig extends EnvironmentConfig {
    enableA11yTesting?: boolean;
}

export interface BrowserDependencyFactories extends DependencyFactories {
    [BrowserDependencyName.ParameterTypeResolver]: () => ParameterTypeResolver;
    [BrowserDependencyName.FormLayoutProvider]: () => FormLayoutProvider;
    [DependencyName.StorageAccountService]: () => StorageAccountService;
}

/**
 * Environment for a browser-based application
 */
export class DefaultBrowserEnvironment
    extends AbstractEnvironment<
        BrowserEnvironmentConfig,
        BrowserDependencyFactories
    >
    implements BrowserEnvironment
{
    name = EnvironmentName.Browser;

    async beforeInit(): Promise<void> {
        initFluentIcons();
    }

    async beforeDestroy(): Promise<void> {
        // No-op
    }

    /**
     * Get the form control for a given parameter
     */
    getFormControl<V extends FormValues, K extends Extract<keyof V, string>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions
    ): JSX.Element {
        const resolver = this.getInjectable<ParameterTypeResolver>(
            BrowserDependencyName.ParameterTypeResolver
        );
        if (!resolver) {
            throw new Error(
                "No parameter type resolver configured for the current environment"
            );
        }
        return resolver.getFormControl(param, opts);
    }

    /**
     * Get the form control for a given parameter
     */
    getFormLayout(layoutType: FormLayoutType = "list"): FormLayout {
        const provider = this.getInjectable<FormLayoutProvider>(
            BrowserDependencyName.FormLayoutProvider
        );
        if (!provider) {
            throw new Error(
                "No form layout provider configured for the current environment"
            );
        }
        return provider.getLayout(layoutType);
    }
}

/**
 * Gets the current global browser environment if one is initialized.
 * Throws an error if there is no environment, or if the current
 * environment is not a browser environment.
 */
export function getBrowserEnvironment(): BrowserEnvironment {
    const currentEnv = getEnvironment();
    if (!currentEnv) {
        throw new Error(
            "Unable to get environment: No environment has been initialized"
        );
    }
    if (
        currentEnv instanceof DefaultBrowserEnvironment ||
        currentEnv instanceof MockBrowserEnvironment
    ) {
        return currentEnv;
    }
    throw new Error(
        "Unable to get environment: The current environment is not a browser environment"
    );
}
