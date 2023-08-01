import { EnvironmentMode, initEnvironment } from "@batch/ui-common";
import { DependencyName } from "@batch/ui-common/lib/environment";
import { createConsoleLogger } from "@batch/ui-common/lib/logging";
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
    DefaultFormControlResolver,
} from "@batch/ui-react/lib/components/form";
import { HttpLocalizer } from "@batch/ui-common/lib/localization";
import {
    FakeStorageAccountService,
    FakeSubscriptionService,
} from "@batch/ui-service";
import { FakeResourceGroupService } from "@batch/ui-service/lib/resource-group";
import { FakeLocationService } from "@batch/ui-service/lib/location";
import { StandardClock } from "@batch/ui-common/lib/datetime";

// Defined by webpack
declare const ENV: {
    MODE: EnvironmentMode;
};

export async function init(rootEl: HTMLElement): Promise<void> {
    const localizer = new HttpLocalizer();
    await localizer.loadTranslations();
    initEnvironment(
        new DefaultBrowserEnvironment(
            {
                mode: ENV.MODE ?? EnvironmentMode.Development,
            },
            {
                [DependencyName.Clock]: () => new StandardClock(),
                [DependencyName.LoggerFactory]: () => createConsoleLogger,
                [DependencyName.Localizer]: () => localizer,
                [DependencyName.HttpClient]: () => new MockHttpClient(),
                [BrowserDependencyName.LocationService]: () =>
                    new FakeLocationService(),
                [BrowserDependencyName.ResourceGroupService]: () =>
                    new FakeResourceGroupService(),
                [BrowserDependencyName.StorageAccountService]: () =>
                    new FakeStorageAccountService(),
                [BrowserDependencyName.SubscriptionService]: () =>
                    new FakeSubscriptionService(),
                [BrowserDependencyName.FormControlResolver]: () =>
                    new DefaultFormControlResolver(),
                [BrowserDependencyName.FormLayoutProvider]: () =>
                    new DefaultFormLayoutProvider(),
            }
        )
    );
    ReactDOM.render(<Application />, rootEl);
}
