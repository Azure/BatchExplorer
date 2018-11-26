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
import { DataContainerListComponent } from "./browse";
import { DataRoutingModule } from "./data-routing.module";
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
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [DataRoutingModule, ...commonModules, DataSharedModule, FileBrowseModule, FileModule],
    entryComponents: [
        DeleteContainerDialogComponent,
        FileGroupCreateFormComponent,
    ],
})
export class DataModule {
}
