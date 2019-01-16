import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { BlobFilesBrowserModule } from "app/components/file/browse";
import { CloudFilePickerComponent, CloudFilePickerDialogComponent } from "./cloud-file-picker";
import { StorageErrorDisplayComponent } from "./errors";
import { FileGroupPickerModule } from "./file-group-picker";
import { FileGroupSasComponent } from "./file-group-sas";
import { FileGroupsPickerComponent } from "./file-groups-picker";
import { FileOrDirectoryPickerModule } from "./file-or-directory-picker";
import { JobIdComponent } from "./job-id/job-id.component";
import { RenderingContainerImagePickerComponent } from "./rendering-container-image-picker";

const components = [
    CloudFilePickerComponent,
    CloudFilePickerDialogComponent,
    FileGroupSasComponent,
    FileGroupsPickerComponent,
    JobIdComponent,
    RenderingContainerImagePickerComponent,
    StorageErrorDisplayComponent,
];

const modules = [
    FileGroupPickerModule,
    FileOrDirectoryPickerModule,
];

@NgModule({
    declarations: components,
    exports: [...components, ...modules],
    imports: [
        ...commonModules,
        ...modules,
        BlobFilesBrowserModule,
    ],
    entryComponents: [CloudFilePickerDialogComponent],
})
export class DataSharedModule {
}
