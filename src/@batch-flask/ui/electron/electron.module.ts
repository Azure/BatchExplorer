import { NgModule } from "@angular/core";
import { ElectronRendererModule } from "@batch-flask/electron";
import { ClipboardService } from "./clipboard.service";
import { CurrentBrowserWindow } from "./current-browser-window";
import { FileSystemService } from "./fs.service";
import { OSService } from "./os.service";

const privateComponents = [];
const publicComponents = [];
const services = [
    FileSystemService,
    ClipboardService,
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
