import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { CodeFileViewerComponent } from "./code-file-viewer";
import { FileContentComponent } from "./file-content.component";
import { FileDetailsComponent } from "./file-details.component";
import { ImageFileViewerComponent } from "./image-file-viewer";
import { LogFileViewerComponent } from "./log-file-viewer";

const components = [FileContentComponent, FileDetailsComponent,
 LogFileViewerComponent, ImageFileViewerComponent, CodeFileViewerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileDetailsModule {

}
