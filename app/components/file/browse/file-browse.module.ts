import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FileDetailsModule } from "app/components/file/details";
import { BlobFilesBrowserComponent } from "./blob-files-browser";
import { FileDirectoryFilter } from "./display";
import {
    FileExplorerComponent, FileExplorerTabsComponent, FileTableViewComponent,
    FileTreeViewComponent,
} from "./file-explorer";

import { NodeFileBrowseComponent } from "./node-file-browse.component";

const components = [
    FileDirectoryFilter, FileTreeViewComponent,
    NodeFileBrowseComponent, BlobFilesBrowserComponent,
    FileExplorerComponent, FileTableViewComponent, FileExplorerTabsComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [FileDetailsModule, ...commonModules],
})
export class FileBrowseModule {

}
