import BatchExplorerHttpClient from "@batch-flask/core/batch-explorer-http-client";
import {
    DependencyName,
    EnvironmentMode,
    initEnvironment
} from "@batch/ui-common";
import { StandardClock } from "@batch/ui-common/lib/datetime";
import { createConsoleLogger } from "@batch/ui-common/lib/logging";
import { BrowserDependencyName, DefaultBrowserEnvironment } from "@batch/ui-react";
import { DefaultFormControlResolver, DefaultFormLayoutProvider } from "@batch/ui-react/lib/components/form";
import { LivePoolService, LiveSubscriptionService, LiveStorageAccountService } from "@batch/ui-service";
import { LiveLocationService } from "@batch/ui-service/lib/location";
import { LiveResourceGroupService } from "@batch/ui-service/lib/resource-group";
import { DesktopLocalizer } from "app/localizer/desktop-localizer";
import { AppTranslationsLoaderService, AuthService } from "app/services";
import { Environment } from "common/constants";

export function initDesktopEnvironment(translationsLoaderService: AppTranslationsLoaderService, authService: AuthService): void {
    initEnvironment(new DefaultBrowserEnvironment(
        {
            mode: ENV === Environment.prod ? EnvironmentMode.Production : EnvironmentMode.Development
        },
        {
            [DependencyName.Clock]: () => new StandardClock(),
            // TODO: Create an adapter which hooks up to the desktop logger
            [DependencyName.LoggerFactory]: () => createConsoleLogger,
            [DependencyName.Localizer]: () => new DesktopLocalizer(translationsLoaderService),
            [DependencyName.HttpClient]:
                () => new BatchExplorerHttpClient(authService),
            [BrowserDependencyName.LocationService]: () =>
                new LiveLocationService(),
            [BrowserDependencyName.PoolService]: () =>
                new LivePoolService(),
            [BrowserDependencyName.ResourceGroupService]: () =>
                new LiveResourceGroupService(),
            [BrowserDependencyName.StorageAccountService]:
                () => new LiveStorageAccountService(),
            [BrowserDependencyName.SubscriptionService]:
                () => new LiveSubscriptionService(),
            [BrowserDependencyName.FormControlResolver]:
                () => new DefaultFormControlResolver(),
            [BrowserDependencyName.FormLayoutProvider]:
                () => new DefaultFormLayoutProvider(),
        }
    ));
}
