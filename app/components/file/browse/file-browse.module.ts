import { NgModule } from "@angular/core";
import { FileModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
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
    imports: [FileModule, ...publicModules, ...commonModules],
})
export class FileBrowseModule {

}
