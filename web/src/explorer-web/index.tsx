import { EnvironmentMode, initEnvironment } from "@batch/ui-common";
import { DependencyName } from "@batch/ui-common/lib/environment";
import { MockHttpClient } from "@batch/ui-common/lib/http";
import { ConsoleLogger } from "@batch/ui-common/lib/logging";
import {
    DefaultFormLayoutProvider,
    DefaultParameterTypeResolver,
} from "@batch/ui-react/lib/components/form";
import {
    BrowserDependencyName,
    DefaultBrowserEnvironment,
} from "@batch/ui-react/lib/environment";
import {
    FakeStorageAccountService,
    FakeSubscriptionService,
} from "@batch/ui-service";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Application } from "./components";

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
                [DependencyName.HttpClient]: () => new MockHttpClient(),
                [DependencyName.StorageAccountService]: () =>
                    new FakeStorageAccountService(),
                [DependencyName.SubscriptionService]: () =>
                    new FakeSubscriptionService(),
                [BrowserDependencyName.ParameterTypeResolver]: () =>
                    new DefaultParameterTypeResolver(),
                [BrowserDependencyName.FormLayoutProvider]: () =>
                    new DefaultFormLayoutProvider(),
            }
        )
    );
    ReactDOM.render(<Application />, rootEl);
}
