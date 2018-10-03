import { NgModule } from "@angular/core";
import { AUTO_UPDATE_MAIN_SERVICE_TOKEN, AutoUpdateMainService, AutoUpdateService } from "./auto-update";

@NgModule({
    imports: [],
    providers: [
        { provide: AutoUpdateService, useClass: AutoUpdateMainService },
        { provide: AUTO_UPDATE_MAIN_SERVICE_TOKEN, useExisting: AutoUpdateService },
    ],
})
export class ElectronMainModule {

}
