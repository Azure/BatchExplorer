import { NgModule } from "@angular/core";
import { AutoUpdateService, AutoUpdateRendererService } from "./auto-update";
import { SharedServiceInjector } from "./shared-services-injector/shared-service-injector";


/**
 * Module that contains electron service to be used in the renderer(Or browser)
 */
@NgModule({
    imports: [],
    providers: [
        { provide: AutoUpdateService, useClass: AutoUpdateRendererService },
        SharedServiceInjector,
    ],
})
export class ElectronRendererModule {

}
