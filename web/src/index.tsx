import {
    EnvironmentMode,
    FakeLocationService,
    FakeResourceGroupService,
    FakeStorageAccountService,
    FakeSubscriptionService,
    initEnvironment,
} from "@azure/bonito-core";
import { StandardClock } from "@azure/bonito-core/lib/datetime";
import { DependencyName } from "@azure/bonito-core/lib/environment";
import { MockHttpClient } from "@azure/bonito-core/lib/http";
import { HttpLocalizer } from "@azure/bonito-core/lib/localization";
import { createConsoleLogger } from "@azure/bonito-core/lib/logging";
import { DefaultBrowserEnvironment } from "@azure/bonito-ui";
import { DefaultFormLayoutProvider } from "@azure/bonito-ui/lib/components/form";
import {
    BrowserDependencyName,
    BrowserEnvironmentConfig,
} from "@azure/bonito-ui/lib/environment";
import {
    BatchBrowserDependencyFactories,
    BatchFormControlResolver,
} from "@batch/ui-react";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import { FakePoolService } from "@batch/ui-service/lib/pool";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Application } from "./components";

// Defined by webpack
declare const ENV: {
    MODE: EnvironmentMode;
};

export async function init(rootEl: HTMLElement): Promise<void> {
    const localizer = new HttpLocalizer();
    await localizer.loadTranslations();
    initEnvironment(
        new DefaultBrowserEnvironment<
            BrowserEnvironmentConfig,
            BatchBrowserDependencyFactories
        >(
            {
                mode: ENV.MODE ?? EnvironmentMode.Development,
                armUrl: "https://management.azure.com",
            },
            {
                [DependencyName.Clock]: () => new StandardClock(),
                [DependencyName.LoggerFactory]: () => createConsoleLogger,
                [DependencyName.Localizer]: () => localizer,
                [DependencyName.HttpClient]: () => new MockHttpClient(),
                [DependencyName.LocationService]: () =>
                    new FakeLocationService(),
                [BatchDependencyName.PoolService]: () => new FakePoolService(),
                [DependencyName.ResourceGroupService]: () =>
                    new FakeResourceGroupService(),
                [DependencyName.StorageAccountService]: () =>
                    new FakeStorageAccountService(),
                [DependencyName.SubscriptionService]: () =>
                    new FakeSubscriptionService(),
                [BrowserDependencyName.FormControlResolver]: () =>
                    new BatchFormControlResolver(),
                [BrowserDependencyName.FormLayoutProvider]: () =>
                    new DefaultFormLayoutProvider(),
            }
        )
    );
    ReactDOM.render(<Application />, rootEl);
}
