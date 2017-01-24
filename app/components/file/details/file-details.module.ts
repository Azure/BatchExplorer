import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileContentComponent } from "./file-content.component";

const components = [FileContentComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileDetailsModule {

}
