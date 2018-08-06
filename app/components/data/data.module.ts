import { NgModule } from "@angular/core";

import { FileModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import {
    DeleteContainerDialogComponent,
    FileGroupCreateFormComponent,
    FileGroupOptionsPickerComponent,
} from "app/components/data/action";
import { DataSharedModule } from "app/components/data/shared";
import { FileBrowseModule } from "app/components/file/browse";
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
    imports: [...commonModules, DataSharedModule, FileBrowseModule, FileModule],
    entryComponents: [
        DeleteContainerDialogComponent,
        FileGroupCreateFormComponent,
    ],
})
export class DataModule {
}
