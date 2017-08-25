import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FileDetailsModule } from "app/components/file/details";
import { FileDirectoryFilter, FileListDisplayComponent } from "./display";
import { FileExplorerComponent, FileTableViewerComponent } from "./file-explorer";
import { NodeFileBrowseComponent } from "./node-file-browse.component";
import { NodeFileListComponent } from "./node-file-list.component";
import { PersistedFileListComponent } from "./persisted-file-list.component";
import { TaskFileListComponent } from "./task-file-list.component";
import { TreeViewDisplayComponent } from "./tree-view";

const components = [
    FileDirectoryFilter, TreeViewDisplayComponent, FileListDisplayComponent,
    NodeFileBrowseComponent, NodeFileListComponent,
    PersistedFileListComponent, TaskFileListComponent,
    FileExplorerComponent, FileTableViewerComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [FileDetailsModule, ...commonModules],
})
export class FileBrowseModule {

}
