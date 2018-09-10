import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { DevTranslationsLoader } from "@batch-flask/compiler";
import { I18nModule, LocaleService, TranslationsLoaderService } from "@batch-flask/core";
import { OSService } from "@batch-flask/ui/electron/os.service";
import { ClientLocaleService } from "client/core";
import { AADService } from "client/core/aad";
import { BatchExplorerInitializer } from "client/core/batch-explorer-initializer";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { FileSystem } from "client/core/fs";
import { ClientTranslationsLoaderService } from "client/core/i18n";
import { LocalDataStore } from "client/core/local-data-store";
import { LocalFileStorage } from "client/core/local-file-storage";
import { TerminalService } from "client/core/terminal";
import { ProxySettingsManager } from "client/proxy";
import { autoUpdater } from "electron-updater";
import { AUTO_UPDATER, BatchExplorerApplication } from "./core/batch-explorer-application";

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
        I18nModule,
    ],
    providers: [
        { provide: AUTO_UPDATER, useValue: autoUpdater },
        { provide: LocaleService, useClass: ClientLocaleService },
        { provide: TranslationsLoaderService, useClass: ClientTranslationsLoaderService },
        DevTranslationsLoader,
        BatchExplorerApplication,
        BatchExplorerInitializer,
        ProxySettingsManager,
        LocalDataStore,
        LocalFileStorage,
        AADService,
        BlIpcMain,
        FileSystem,
        OSService,

        ...servicesToInitialize,
    ],
})
export class BatchExplorerClientModule {
    public ngDoBootstrap() {
        // Nothing to do
    }
}
