import { NgModule } from "@angular/core";
import { GlobalStorage } from "@batch-flask/core";
import { AutoUpdateRendererService, AutoUpdateService } from "./auto-update";
import { CurrentBrowserWindow } from "./current-browser-window";
import { FileSystemService } from "./fs.service";
import { RendererGlobalStorage } from "./global-storage";
import { IpcService } from "./ipc.service";
import { OSService } from "./os.service";
import { ElectronRemote } from "./remote.service";
import { SharedServiceInjector } from "./shared-service-injector";
import { ElectronShell } from "./shell.service";

/**
 * Module that contains electron service to be used in the renderer(Or browser)
 */
@NgModule({
    imports: [],
    providers: [
        { provide: AutoUpdateService, useClass: AutoUpdateRendererService },
        { provide: GlobalStorage, useClass: RendererGlobalStorage },
        SharedServiceInjector,
        ElectronShell,
        ElectronRemote,
        IpcService,
        FileSystemService,
        OSService,
        CurrentBrowserWindow,
    ],
})
export class ElectronRendererModule {

}
