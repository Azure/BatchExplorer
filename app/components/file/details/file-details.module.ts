import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileContentComponent } from "./file-content.component";
import { FileDetailsComponent } from "./file-details.component";
import { LogFileViewerComponent } from "./log-file-viewer";

const components = [FileContentComponent, FileDetailsComponent, LogFileViewerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileDetailsModule {

}
