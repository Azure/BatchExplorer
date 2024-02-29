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
import { AlertNotifier } from "@azure/bonito-core/lib/notification/alert-notifier";
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
import { FakeNodeService, FakeSkuService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import { FakePoolService } from "@batch/ui-service/lib/pool";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Application } from "./components";

// Defined by webpack
declare const ENV: {
    MODE: EnvironmentMode;
};

// Bootstrap the app
const rootEl = document.getElementById("batch-explorer-root");
if (!rootEl) {
    throw new Error(
        "Failed to initialize: No element with an ID of 'batch-explorer-root' found."
    );
}
init(rootEl);

export async function init(rootEl: HTMLElement): Promise<void> {
    const localizer = new HttpLocalizer();
    await localizer.loadTranslations("/resources/i18n");
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
                [DependencyName.Notifier]: () => new AlertNotifier(), // TODO: update with real notification implementation
                [BatchDependencyName.PoolService]: () => new FakePoolService(),
                [BatchDependencyName.NodeService]: () => new FakeNodeService(),
                [BatchDependencyName.SkuService]: () => new FakeSkuService(),
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
