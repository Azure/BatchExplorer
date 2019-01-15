import { NgModule } from "@angular/core";
import { ElectronRendererModule } from "@batch-flask/electron";
import { CurrentBrowserWindow } from "./current-browser-window";

const privateComponents = [];
const publicComponents = [];
const services = [
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
