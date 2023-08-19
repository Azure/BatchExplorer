import {
    DependencyName,
    EnvironmentMode,
    LiveLocationService,
    LiveResourceGroupService,
    LiveStorageAccountService,
    LiveSubscriptionService,
    initEnvironment
} from "@azure/bonito-core";
import { StandardClock } from "@azure/bonito-core/lib/datetime";
import { createConsoleLogger } from "@azure/bonito-core/lib/logging";
import { DefaultFormLayoutProvider } from "@azure/bonito-ui/lib/components/form";
import { BrowserDependencyName, BrowserEnvironmentConfig, DefaultBrowserEnvironment } from "@azure/bonito-ui/lib/environment";
import BatchExplorerHttpClient from "@batch-flask/core/batch-explorer-http-client";
import { BatchBrowserDependencyFactories, BatchFormControlResolver } from "@batch/ui-react";
import { LivePoolService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import { DesktopLocalizer } from "app/localizer/desktop-localizer";
import { AppTranslationsLoaderService, AuthService, BatchExplorerService } from "app/services";
import { Environment } from "common/constants";

export function initDesktopEnvironment(
    translationsLoaderService: AppTranslationsLoaderService,
    authService: AuthService,
    batchExplorer: BatchExplorerService
): void {
    initEnvironment(new DefaultBrowserEnvironment<
        BrowserEnvironmentConfig,
        BatchBrowserDependencyFactories
    >(
        {
            mode: ENV === Environment.prod ? EnvironmentMode.Production : EnvironmentMode.Development,
            armUrl: batchExplorer.azureEnvironment.arm
        },
        {
            [DependencyName.Clock]: () => new StandardClock(),
            // TODO: Create an adapter which hooks up to the desktop logger
            [DependencyName.LoggerFactory]: () => createConsoleLogger,
            [DependencyName.Localizer]: () => new DesktopLocalizer(translationsLoaderService),
            [DependencyName.HttpClient]:
                () => new BatchExplorerHttpClient(authService),
            [DependencyName.LocationService]: () =>
                new LiveLocationService(),
            [BatchDependencyName.PoolService]: () =>
                new LivePoolService(),
            [DependencyName.ResourceGroupService]: () =>
                new LiveResourceGroupService(),
            [DependencyName.StorageAccountService]:
                () => new LiveStorageAccountService(),
            [DependencyName.SubscriptionService]:
                () => new LiveSubscriptionService(),
            [BrowserDependencyName.FormControlResolver]:
                () => new BatchFormControlResolver(),
            [BrowserDependencyName.FormLayoutProvider]:
                () => new DefaultFormLayoutProvider(),
        }
    ));
}
