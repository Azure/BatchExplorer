import { EnvironmentMode, initEnvironment } from "@batch/ui-common";
import { DependencyName } from "@batch/ui-common/lib/environment";
import { ConsoleLogger } from "@batch/ui-common/lib/logging";
import { MockHttpClient } from "@batch/ui-common/lib/http";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Application } from "./components";
import {
    BrowserDependencyName,
    DefaultBrowserEnvironment,
} from "@batch/ui-react/lib/environment";
import {
    DefaultFormLayoutProvider,
    DefaultParameterTypeResolver,
} from "@batch/ui-react/lib/components/form";
import { StandardLocalizer } from "@batch/ui-common/lib/localization";

// Defined by webpack
declare const ENV: {
    MODE: EnvironmentMode;
};

export function init(rootEl: HTMLElement): void {
    initEnvironment(
        new DefaultBrowserEnvironment(
            {
                mode: ENV.MODE ?? EnvironmentMode.Development,
            },
            {
                [DependencyName.Logger]: () => new ConsoleLogger(),
                [DependencyName.Localizer]: () => new StandardLocalizer(),
                [DependencyName.HttpClient]: () => new MockHttpClient(),
                [BrowserDependencyName.ParameterTypeResolver]: () =>
                    new DefaultParameterTypeResolver(),
                [BrowserDependencyName.FormLayoutProvider]: () =>
                    new DefaultFormLayoutProvider(),
            }
        )
    );
    ReactDOM.render(<Application />, rootEl);
}
