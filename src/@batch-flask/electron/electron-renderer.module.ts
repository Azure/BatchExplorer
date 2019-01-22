import { NgModule } from "@angular/core";
import { LocalStorage } from "@batch-flask/core";
import { AutoUpdateRendererService, AutoUpdateService } from "./auto-update";
import { CurrentBrowserWindow } from "./current-browser-window";
import { FileSystemService } from "./fs.service";
import { IpcService } from "./ipc.service";
import { RendererLocalStorage } from "./local-storage";
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
        { provide: LocalStorage, useClass: RendererLocalStorage },
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
