import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { DevTranslationsLoader } from "@batch-flask/compiler";
import {
    DataStore,
    GlobalStorage,
    LocaleService,
    TranslationsLoaderService,
    USER_CONFIGURATION_STORE,
} from "@batch-flask/core";
import { GLOBAL_STORAGE, MainGlobalStorage } from "@batch-flask/electron";
import { ElectronMainModule } from "@batch-flask/electron/electron-main.module";
import { AzureEnvironmentService } from "client/azure-environment";
import { ClientTranslationsLoaderService } from "client/core/i18n";
import { MainConfigurationStore } from "client/core/user-configuration";
import { ClientLocaleService } from "./core";
import { AADService } from "./core/aad";
import { BatchExplorerApplication } from "./core/batch-explorer-application";
import { BatchExplorerInitializer } from "./core/batch-explorer-initializer";
import { BatchExplorerProcess } from "./core/batch-explorer-process";
import { BlIpcMain } from "./core/bl-ipc-main";
import { StorageBlobAdapter } from "./core/storage";
import { LocalDataStore } from "./core/local-data-store";
import { BatchExplorerProperties } from "./core/properties";
import { ClientTelemetryModule } from "./core/telemetry";
import { TerminalService } from "./core/terminal";
import { MenuModule } from "./menu/menu.module";
import { ProxySettingsManager } from "./proxy";

/**
 * List services here that needs to be create even if they are not injected anywhere
 */
const servicesToInitialize = [
    TerminalService,
];

// make sure that the services are created on app start
export function initializeServices(injector) {
    for (const service of servicesToInitialize) {
        injector.get(service);
    }
}

/**
 * BatchExplorer client module. This is the root module for managing dependency injection in the Client process
 * Only import other modules or use providers.
 * DO NOT define any components here.
 */
@NgModule({
    imports: [
        ServerModule,
        ClientTelemetryModule,
        MenuModule,
        ElectronMainModule,
    ],
    providers: [
        { provide: LocaleService, useClass: ClientLocaleService },
        { provide: TranslationsLoaderService, useClass: ClientTranslationsLoaderService },
        { provide: DataStore, useClass: LocalDataStore },
        { provide: USER_CONFIGURATION_STORE, useClass: MainConfigurationStore },
        { provide: GlobalStorage, useExisting: MainGlobalStorage },
        { provide: GLOBAL_STORAGE, useExisting: GlobalStorage },
        MainGlobalStorage,
        DevTranslationsLoader,
        BatchExplorerApplication,
        BatchExplorerProcess,
        BatchExplorerInitializer,
        ProxySettingsManager,
        BatchExplorerProperties,
        AADService,
        BlIpcMain,
        StorageBlobAdapter,
        AzureEnvironmentService,
        ...servicesToInitialize,
    ],
})
export class BatchExplorerClientModule {
    public ngDoBootstrap() {
        // Nothing to do
    }
}
