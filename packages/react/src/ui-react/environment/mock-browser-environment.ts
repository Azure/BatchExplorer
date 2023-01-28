import { Parameter } from "@batch/ui-common";
import { MockEnvironment } from "@batch/ui-common/lib/environment";
import { FormValues } from "@batch/ui-common/lib/form";
import React from "react";
import { FormControlOptions, ParameterTypeResolver } from "../components/form";
import {
    // FormLayout,
    FormLayoutProvider,
    FormLayoutType,
    LayoutProps,
} from "../components/form/form-layout";
import {
    BrowserDependencyName,
    BrowserEnvironment,
    BrowserEnvironmentConfig,
} from "./browser-environment";
import { initFluentIcons } from "./environment-util";

/**
 * Mock environment for a browser-based application
 */
export class MockBrowserEnvironment
    extends MockEnvironment<BrowserEnvironmentConfig>
    implements BrowserEnvironment {
    isMockBrowserEnvironment: boolean = true;

    async beforeInit(): Promise<void> {
        super.beforeInit();
        initFluentIcons();

        // If enableA11yTesting hasn't been explicitly set, see if it has
        // been configured via environment variable
        if (this.config.enableA11yTesting == null) {
            if (this.config.envVars?.BE_ENABLE_A11Y_TESTING === "true") {
                this.config.enableA11yTesting = true;
            }
        }
    }

    // TODO: This code shouldn't need to be duplicated from DefaultBrowserEnvironment
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

    // TODO: This code shouldn't need to be duplicated from DefaultBrowserEnvironment
    getFormLayout<V extends FormValues>(layoutType: FormLayoutType = "list"): React.FC<LayoutProps<V>> {
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
