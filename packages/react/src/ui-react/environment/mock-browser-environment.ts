import { Parameter } from "@batch/ui-common";
import { MockEnvironment } from "@batch/ui-common/lib/environment";
import { ParameterTypeResolver } from "../components/form";
import {
    FormLayout,
    FormLayoutProvider,
    FormLayoutType,
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
    implements BrowserEnvironment
{
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
    getFormControl<
        FormValues extends Record<string, unknown>,
        EntryName extends Extract<keyof FormValues, string>
    >(param: Parameter<FormValues, EntryName>): JSX.Element {
        const resolver = this.getInjectable<ParameterTypeResolver>(
            BrowserDependencyName.ParameterTypeResolver
        );
        if (!resolver) {
            throw new Error(
                "No parameter type resolver configured for the current environment"
            );
        }
        return resolver.getFormControl(param);
    }

    // TODO: This code shouldn't need to be duplicated from DefaultBrowserEnvironment
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
