import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FileDetailsModule } from "app/components/file/details";
import { FileDirectoryFilter, FileListDisplayComponent } from "./display";
import { FileExplorerComponent, FileTableViewerComponent, FileTreeViewComponent } from "./file-explorer";
import { NodeFileBrowseComponent } from "./node-file-browse.component";
import { PersistedFileListComponent } from "./persisted-file-list.component";

const components = [
    FileDirectoryFilter, FileTreeViewComponent, FileListDisplayComponent,
    NodeFileBrowseComponent,
    PersistedFileListComponent,
    FileExplorerComponent, FileTableViewerComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [FileDetailsModule, ...commonModules],
})
export class FileBrowseModule {

}
