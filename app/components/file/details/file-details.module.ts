import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileContentComponent } from "./file-content.component";
import { FileDetailsComponent } from "./file-details.component";

const components = [FileContentComponent, FileDetailsComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileDetailsModule {

}
