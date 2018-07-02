import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { OSService } from "@batch-flask/ui/electron/os.service";
import { AADService } from "client/core/aad";
import { BatchLabsInitializer } from "client/core/batchlabs-initializer";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { FileSystem } from "client/core/fs";
import { LocalDataStore } from "client/core/local-data-store";
import { LocalFileStorage } from "client/core/local-file-storage";
import { TerminalService } from "client/core/terminal";
import { ProxySettingsManager } from "client/proxy";
import { autoUpdater } from "electron-updater";
import { AUTO_UPDATER, BatchLabsApplication } from "./core/batchlabs-application";

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
 * BatchLabs client module. This is the root module for managing dependency injection in the Client process
 * Only import other modules or use providers.
 * DO NOT define any components here.
 */
@NgModule({
    imports: [
        ServerModule,
    ],
    providers: [
        { provide: AUTO_UPDATER, useValue: autoUpdater },
        BatchLabsApplication,
        BatchLabsInitializer,
        ProxySettingsManager,
        LocalDataStore,
        LocalFileStorage,
        AADService,
        BlIpcMain,
        FileSystem,

        // TODO-TIM move
        OSService,

        ...servicesToInitialize,
    ],
})
export class BatchLabsClientModule {
    public ngDoBootstrap() {
        // Nothing to do
    }
}
