import { NgModule } from "@angular/core";

import { ElectronRendererModule } from "@batch-flask/electron/electron-renderer.module";
import { AutoUpdateService } from "./auto-update.service";
import { ClipboardService } from "./clipboard.service";
import { CurrentBrowserWindow } from "./current-browser-window";
import { FileSystemService } from "./fs.service";
import { IpcService } from "./ipc.service";
import { OSService } from "./os.service";
import { ElectronRemote } from "./remote.service";
import { ElectronShell } from "./shell.service";

const privateComponents = [];
const publicComponents = [];
const services = [
    ElectronShell,
    ElectronRemote,
    FileSystemService,
    IpcService,
    ClipboardService,
    AutoUpdateService,
    OSService,
    CurrentBrowserWindow,
];

@NgModule({
    imports: [ElectronRendererModule],
    declarations: [...privateComponents, publicComponents],
    exports: [...publicComponents],
    providers: services,
})
export class ElectronModule {

}
