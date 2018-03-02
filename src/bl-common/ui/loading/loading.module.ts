import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { ListLoadingComponent } from "app/components/base/loading";
import { ButtonsModule } from "../buttons/buttons.module";
import { LoadingComponent } from "./loading.component";
import { SimpleLoadingComponent } from "./simple-loading.component";

const privateComponents = [];
const publicComponents = [ListLoadingComponent, LoadingComponent, SimpleLoadingComponent];

@NgModule({
    imports: [BrowserModule, ButtonsModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class LoadingModule {

}
