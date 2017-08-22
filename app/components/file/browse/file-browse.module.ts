import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FileExplorerComponent } from "app/components/file/browse/file-explorer";
import { FileDetailsModule } from "app/components/file/details";
import { FileDirectoryFilter, FileListDisplayComponent } from "./display";
import { NodeFileBrowseComponent } from "./node-file-browse.component";
import { NodeFileListComponent } from "./node-file-list.component";
import { PersistedFileListComponent } from "./persisted-file-list.component";
import { TaskFileListComponent } from "./task-file-list.component";
import { TreeViewDisplayComponent } from "./tree-view";

const components = [
    FileDirectoryFilter, TreeViewDisplayComponent, FileListDisplayComponent,
    NodeFileBrowseComponent, NodeFileListComponent,
    PersistedFileListComponent, TaskFileListComponent,
    FileExplorerComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [FileDetailsModule, ...commonModules],
})
export class FileBrowseModule {

}
