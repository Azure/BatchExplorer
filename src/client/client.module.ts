import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { AADService } from "client/core/aad";
import { BatchLabsInitializer } from "client/core/batchlabs-initializer";
import { FileSystem } from "client/core/fs";
import { LocalDataStore } from "client/core/local-data-store";
import { LocalFileStorage } from "client/core/local-file-storage";
import { ProxySettingsManager } from "client/proxy";
import { autoUpdater } from "electron-updater";
import { AUTO_UPDATER, BatchLabsApplication } from "./core/batchlabs-application";

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
        FileSystem,
    ],
})
export class BatchLabsClientModule {
    public ngDoBootstrap() {
        // Nothing to do
    }
}
