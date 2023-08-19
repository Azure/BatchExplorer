import {
    AbstractEnvironment,
    Environment,
    EnvironmentConfig,
    EnvironmentName,
    getEnvironment,
} from "@azure/bonito-core/lib/environment";
import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { FormControlResolver, FormControlProps } from "../components/form";
import {
    FormLayout,
    FormLayoutProvider,
    FormLayoutType,
} from "../components/form/form-layout";
import { isReactParameter } from "../form/react-parameter";
import {
    BrowserDependencyFactories,
    BrowserDependencyName,
} from "./browser-dependencies";
import { initFluentIcons } from "./environment-util";
import { MockBrowserEnvironment } from "./mock-browser-environment";

export interface BrowserEnvironment<
    C extends BrowserEnvironmentConfig = BrowserEnvironmentConfig
> extends Environment<C> {
    getFormControl<
        V extends FormValues,
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>
    >(
        props: FormControlProps<V, K, D>
    ): JSX.Element;

    getFormLayout(layoutType?: FormLayoutType): FormLayout;
}

export interface BrowserEnvironmentConfig extends EnvironmentConfig {
    enableA11yTesting?: boolean;
}

/**
 * Environment for a browser-based application
 */
export class DefaultBrowserEnvironment<
        C extends BrowserEnvironmentConfig = BrowserEnvironmentConfig,
        D extends BrowserDependencyFactories = BrowserDependencyFactories
    >
    extends AbstractEnvironment<C, D>
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
    getFormControl<
        V extends FormValues,
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>
    >(props: FormControlProps<V, K, D>): JSX.Element {
        // If the parameter has a render function, use it. Otherwise
        // look up the form control using a the configured resolver.
        if (isReactParameter(props.param) && props.param.render) {
            return props.param.render(props);
        }

        const resolver = this.getInjectable<FormControlResolver>(
            BrowserDependencyName.FormControlResolver
        );
        if (!resolver) {
            throw new Error(
                "No parameter type resolver configured for the current environment"
            );
        }
        return resolver.getFormControl(props);
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
