import { NgModule } from "@angular/core";
import { ElectronRemote, ElectronShell } from "../ui";
import { AutoUpdateRendererService, AutoUpdateService } from "./auto-update";
import { SharedServiceInjector } from "./shared-service-injector";

/**
 * Module that contains electron service to be used in the renderer(Or browser)
 */
@NgModule({
    imports: [],
    providers: [
        { provide: AutoUpdateService, useClass: AutoUpdateRendererService },
        SharedServiceInjector,
        ElectronShell,
        ElectronRemote,
    ],
})
export class ElectronRendererModule {

}
