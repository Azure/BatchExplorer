import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormModule, I18nUIModule } from "@batch-flask/ui";
import { FileOrDirectoryPickerComponent } from "./file-or-directory-picker.component";

const publicComponents = [FileOrDirectoryPickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        FormModule,
        ReactiveFormsModule,
        FormsModule,
        I18nUIModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class FileOrDirectoryPickerModule {
}
