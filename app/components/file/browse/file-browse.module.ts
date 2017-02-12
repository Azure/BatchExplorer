import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileDirectoryFilter, FileListDisplayComponent } from "./display";
import { NodeFileBrowseComponent } from "./node-file-browse.component";
import { NodeFileListComponent } from "./node-file-list.component";
import { TaskFileListComponent } from "./task-file-list.component";

const components = [FileDirectoryFilter, FileListDisplayComponent,
    NodeFileListComponent, TaskFileListComponent, NodeFileBrowseComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileBrowseModule {

}
