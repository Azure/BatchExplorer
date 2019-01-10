import { NgModule } from "@angular/core";
import { FileModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { BlobFilesBrowserModule, FileBrowseModule } from "app/components/file/browse";
import { StorageAccountPickerModule } from "../common";
import {
    DeleteContainerDialogComponent,
} from "./action";
import { FileGroupCreateModule } from "./action/add";
import { DataContainerListComponent } from "./browse";
import { DataRoutingModule } from "./data-routing.module";
import {
    DataContainerConfigurationComponent,
    DataContainerFilesComponent,
    DataDefaultComponent,
    DataDetailsComponent,
} from "./details";
import { DataHomeComponent } from "./home";
import { DataSharedModule } from "./shared";

const components = [
    DataContainerConfigurationComponent,
    DataContainerFilesComponent,
    DataHomeComponent,
    DataDefaultComponent, DataDetailsComponent,
    DeleteContainerDialogComponent,
    DataContainerListComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        DataRoutingModule, ...commonModules,
        DataSharedModule,
        FileBrowseModule, FileModule,
        FileGroupCreateModule,
        BlobFilesBrowserModule,
        StorageAccountPickerModule,
    ],
    entryComponents: [
        DeleteContainerDialogComponent,
    ],
})
export class DataModule {
}
