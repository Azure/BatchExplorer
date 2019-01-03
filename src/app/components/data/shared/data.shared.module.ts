import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { BlobContainerPickerComponent } from "./blob-container-picker";
import { CloudFilePickerComponent, CloudFilePickerDialogComponent } from "./cloud-file-picker";
import { StorageErrorDisplayComponent } from "./errors";
import { FileGroupPickerModule } from "./file-group-picker";
import { FileGroupSasComponent } from "./file-group-sas";
import { FileGroupsPickerComponent } from "./file-groups-picker";
import { FileOrDirectoryPickerModule } from "./file-or-directory-picker";
import { JobIdComponent } from "./job-id/job-id.component";
import { StorageAccountPickerComponent } from "./storage-account-picker";

const components = [
    BlobContainerPickerComponent,
    CloudFilePickerComponent,
    CloudFilePickerDialogComponent,
    FileGroupSasComponent,
    FileGroupsPickerComponent,
    JobIdComponent,
    StorageAccountPickerComponent,
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
        ...commonModules, FileBrowseModule,
        ...modules,
    ],
    entryComponents: [CloudFilePickerDialogComponent],
})
export class DataSharedModule {
}
