import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FileDirectoryFilter, FileListDisplayComponent, TreeViewDisplayComponent } from "./display";
import { NodeFileBrowseComponent } from "./node-file-browse.component";
import { NodeFileListComponent } from "./node-file-list.component";
import { PersistedFileListComponent } from "./persisted-file-list.component";
import { TaskFileListComponent } from "./task-file-list.component";

const components = [
    FileDirectoryFilter, TreeViewDisplayComponent, FileListDisplayComponent,
    NodeFileBrowseComponent, NodeFileListComponent,
    PersistedFileListComponent, TaskFileListComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileBrowseModule {

}
