import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule, FormModule, I18nUIModule } from "@batch-flask/ui";
import { EditableTableModule } from "@batch-flask/ui/form/editable-table";
import { BlobFilesBrowserModule } from "app/components/file/browse";
import { BlobContainerPickerModule } from "../blob-container-picker";
import { StorageAccountPickerModule } from "../storage-account-picker";
import { ResourceFileCloudFileDialogComponent } from "./resourcefile-cloud-file-dialog";
import { ResourceFileContainerSourceComponent } from "./resourcefile-container-source";
import { ResourceFilePickerRowComponent } from "./resourcefile-picker-row";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";

const publicComponents = [ResourcefilePickerComponent];
const privateComponents = [
    ResourceFilePickerRowComponent,
    ResourceFileCloudFileDialogComponent,
    ResourceFileContainerSourceComponent,
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        EditableTableModule,
        ButtonsModule,
        FormModule,
        BlobContainerPickerModule,
        StorageAccountPickerModule,
        I18nUIModule,
        BlobFilesBrowserModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [ResourceFileCloudFileDialogComponent],
})
export class ResourceFilePickerModule {
}
