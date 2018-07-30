import { NgModule } from "@angular/core";

import { AutoUpdateService } from "./auto-update.service";
import { ClipboardService } from "./clipboard.service";
import { CurrentBrowserWindow } from "./current-browser-window";
import { IpcService } from "./ipc.service";
import { OSService } from "./os.service";
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
    OSService,
    CurrentBrowserWindow,
];

@NgModule({
    imports: [],
    declarations: [...privateComponents, publicComponents],
    exports: [...publicComponents],
    providers: services,
})
export class ElectronModule {

}
