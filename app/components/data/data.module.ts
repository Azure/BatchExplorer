import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { FileDetailsModule } from "app/components/file/details";
import { FileGroupListComponent, FileGroupPreviewComponent } from "./browse";
import { DataContainerFilesComponent, DataDefaultComponent, DataDetailsComponent } from "./details";
import { StorageErrorDisplayComponent } from "./details/errors";
import { DataHomeComponent } from "./home";

const components = [
    DataContainerFilesComponent, DataHomeComponent, DataDefaultComponent, DataDetailsComponent,
    FileGroupListComponent, FileGroupPreviewComponent, StorageErrorDisplayComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [ FileBrowseModule, FileDetailsModule, ...commonModules ],
    entryComponents: [
        // ApplicationCreateDialogComponent,
        // ApplicationEditDialogComponent,
        // DeleteApplicationDialogComponent,
    ],
})
export class DataModule {
}
