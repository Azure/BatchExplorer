import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material";
import { ButtonsModule, FormModule } from "@batch-flask/ui";
import { FileOrDirectoryPickerModule } from "../../shared/file-or-directory-picker";
import { FileGroupCreateFormComponent } from "./file-group-create-form.component";
import { FileGroupOptionsPickerComponent } from "./file-group-options-picker.component";

const publicComponents = [FileGroupCreateFormComponent];
const privateComponents = [FileGroupOptionsPickerComponent];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormModule,
        MatCheckboxModule,
        ButtonsModule,
        FileOrDirectoryPickerModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [FileGroupCreateFormComponent],
})
export class FileGroupCreateModule {
}
