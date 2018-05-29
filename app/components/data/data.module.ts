import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import {
    DeleteContainerDialogComponent,
    FileGroupCreateFormComponent,
    FileGroupOptionsPickerComponent,
} from "app/components/data/action";
import { DataSharedModule } from "app/components/data/shared";
import { FileBrowseModule } from "app/components/file/browse";
import { FileDetailsModule } from "app/components/file/details";
import { DataContainerListComponent, FileGroupPreviewComponent } from "./browse";
import {
    DataContainerConfigurationComponent,
    DataContainerFilesComponent,
    DataDefaultComponent,
    DataDetailsComponent,
} from "./details";
import { DataHomeComponent } from "./home";

const components = [
    DataContainerConfigurationComponent,
    DataContainerFilesComponent,
    DataHomeComponent,
    DataDefaultComponent, DataDetailsComponent,
    FileGroupCreateFormComponent,
    DeleteContainerDialogComponent,
    DataContainerListComponent,
    FileGroupOptionsPickerComponent,
    FileGroupPreviewComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, DataSharedModule, FileBrowseModule, FileDetailsModule],
    entryComponents: [
        DeleteContainerDialogComponent,
        FileGroupCreateFormComponent,
    ],
})
export class DataModule {
}
