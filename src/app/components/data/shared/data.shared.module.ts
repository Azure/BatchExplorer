import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { BlobContainerPickerComponent } from "./blob-container-picker";
import { CloudFilePickerComponent, CloudFilePickerDialogComponent } from "./cloud-file-picker";
import { StorageErrorDisplayComponent } from "./errors";
import { FileGroupPickerComponent } from "./file-group-picker";
import { FileGroupSasComponent } from "./file-group-sas";
import { FileGroupsPickerComponent } from "./file-groups-picker";
import { FileOrDirectoryPickerComponent } from "./file-or-directory-picker";
import { JobIdComponent } from "./job-id/job-id.component";
import { StorageAccountPickerComponent } from "./storage-account-picker";

const components = [
    BlobContainerPickerComponent,
    CloudFilePickerComponent,
    CloudFilePickerDialogComponent,
    FileGroupPickerComponent,
    FileGroupSasComponent,
    FileGroupsPickerComponent,
    FileOrDirectoryPickerComponent,
    JobIdComponent,
    StorageAccountPickerComponent,
    StorageErrorDisplayComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules, FileBrowseModule,
    ],
    entryComponents: [CloudFilePickerDialogComponent],
})
export class DataSharedModule {
}
