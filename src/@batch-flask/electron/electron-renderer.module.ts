import { NgModule } from "@angular/core";
import { AutoUpdateRendererService } from "./auto-update";

const services = [
    AutoUpdateRendererService,
];

@NgModule({
    imports: [],
    providers: services,
})
export class ElectronRendererModule {

}
