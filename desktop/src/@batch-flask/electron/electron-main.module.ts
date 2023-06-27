import { NgModule } from "@angular/core";
import { AUTO_UPDATE_MAIN_SERVICE_TOKEN, AutoUpdateService } from "./auto-update";
import { AutoUpdateMainService } from "./auto-update/auto-update-main.service";
import { FileSystemService } from "./fs.service";
import { OSService } from "./os.service";

@NgModule({
    imports: [],
    providers: [
        { provide: AutoUpdateService, useClass: AutoUpdateMainService },
        { provide: AUTO_UPDATE_MAIN_SERVICE_TOKEN, useExisting: AutoUpdateService },
        FileSystemService,
        OSService,
    ],
})
export class ElectronMainModule {

}
