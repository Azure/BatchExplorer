import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { ButtonsModule } from "../buttons/buttons.module";
import { LoadingComponent } from "./loading.component";
import { SimpleLoadingComponent } from "./simple-loading.component";

const privateComponents = [];
const publicComponents = [LoadingComponent, SimpleLoadingComponent];

@NgModule({
    imports: [BrowserModule, ButtonsModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class LoadingModule {

}
