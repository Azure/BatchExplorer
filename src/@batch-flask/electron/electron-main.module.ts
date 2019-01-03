import { NgModule } from "@angular/core";
import { AUTO_UPDATE_MAIN_SERVICE_TOKEN, AutoUpdateService } from "./auto-update";
import { AutoUpdateMainService } from "./auto-update/auto-update-main.service";

@NgModule({
    imports: [],
    providers: [
        { provide: AutoUpdateService, useClass: AutoUpdateMainService },
        { provide: AUTO_UPDATE_MAIN_SERVICE_TOKEN, useExisting: AutoUpdateService },
    ],
})
export class ElectronMainModule {

}
