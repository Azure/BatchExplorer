import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileTooLargeComponent } from "app/components/file/details/file-too-large";
import { CodeFileViewerComponent } from "./code-file-viewer";
import { FileContentComponent } from "./file-content.component";
import { FileDetailsViewComponent } from "./file-details-view";
import { ImageFileViewerComponent } from "./image-file-viewer";
import { LogFileViewerComponent } from "./log-file-viewer";

const components = [FileContentComponent, FileDetailsViewComponent, FileTooLargeComponent,
    LogFileViewerComponent, ImageFileViewerComponent, CodeFileViewerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileDetailsModule {

}
