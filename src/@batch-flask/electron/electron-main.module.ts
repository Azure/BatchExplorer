import { NgModule } from "@angular/core";
import { AutoUpdateMainService, AutoUpdateService } from "./auto-update";

@NgModule({
    imports: [],
    providers: [
        { provide: AutoUpdateService, useClass: AutoUpdateMainService },
    ],
})
export class ElectronMainModule {

}
