import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import {
    DeleteContainerDialogComponent,
    FileGroupCreateFormComponent,
} from "app/components/data/action";
import { FileBrowseModule } from "app/components/file/browse";
import { FileDetailsModule } from "app/components/file/details";
import { FileGroupListComponent, FileGroupPreviewComponent } from "./browse";
import {
    DataContainerConfigurationComponent,
    DataContainerFilesComponent,
    DataDefaultComponent,
    DataDetailsComponent,
} from "./details";
import { StorageErrorDisplayComponent } from "./details/errors";
import { DataHomeComponent } from "./home";

const components = [DataContainerConfigurationComponent, DataContainerFilesComponent, DataHomeComponent,
    DataDefaultComponent, DataDetailsComponent, FileGroupCreateFormComponent, DeleteContainerDialogComponent,
    FileGroupListComponent, FileGroupPreviewComponent, StorageErrorDisplayComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [ ...commonModules, FileBrowseModule, FileDetailsModule ],
    entryComponents: [
        DeleteContainerDialogComponent,
        FileGroupCreateFormComponent,
    ],
})
export class DataModule {
}
