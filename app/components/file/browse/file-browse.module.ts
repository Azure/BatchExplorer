import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileDirectoryFilter, FileListDisplayComponent, FileTypeFilter } from "./display";
import { NodeFileListComponent } from "./node-file-list.component";
import { TaskFileListComponent } from "./task-file-list.component";

const components = [FileDirectoryFilter, FileListDisplayComponent, FileTypeFilter,
    NodeFileListComponent, TaskFileListComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
})
export class FileBrowseModule {

}
