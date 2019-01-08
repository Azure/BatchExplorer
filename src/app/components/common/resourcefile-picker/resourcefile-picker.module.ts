import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule, FormModule, I18nUIModule } from "@batch-flask/ui";
import { EditableTableModule } from "@batch-flask/ui/form/editable-table";
import { BlobContainerPickerModule } from "../blob-container-picker";
import { StorageAccountPickerModule } from "../storage-account-picker";
import { ResourceFileCloudFileDialogComponent } from "./resourcefile-cloud-file-dialog";
import { ResourceFilePickerRowComponent } from "./resourcefile-picker-row";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";

const publicComponents = [ResourcefilePickerComponent];
const privateComponents = [ResourceFilePickerRowComponent, ResourceFileCloudFileDialogComponent];

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
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [ResourceFileCloudFileDialogComponent],
})
export class ResourceFilePickerModule {
}
