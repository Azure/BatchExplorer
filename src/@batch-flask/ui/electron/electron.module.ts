import { NgModule } from "@angular/core";

import { AutoUpdateService } from "./auto-update.service";
import { ClipboardService } from "./clipboard.service";
import { IpcService } from "./ipc.service";
import { ElectronRemote } from "./remote.service";
import { ElectronShell } from "./shell.service";

const privateComponents = [];
const publicComponents = [];
const services = [
    ElectronShell,
    ElectronRemote,
    IpcService,
    ClipboardService,
    AutoUpdateService,
];

@NgModule({
    imports: [],
    declarations: [...privateComponents, publicComponents],
    exports: [...publicComponents],
    providers: services,
})
export class ElectronModule {

}
