import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FileDetailsModule } from "app/components/file/details";
import { BlobFilesBrowserComponent } from "./blob-files-browser";
import { FileExplorerModule } from "./file-explorer";

import { NodeFileBrowseComponent } from "./node-file-browse.component";

const components = [
    NodeFileBrowseComponent, BlobFilesBrowserComponent,
];

const publicModules = [
    FileExplorerModule,
];
@NgModule({
    declarations: components,
    exports: [...components, ...publicModules],
    imports: [FileDetailsModule, ...publicModules, ...commonModules],
})
export class FileBrowseModule {

}
