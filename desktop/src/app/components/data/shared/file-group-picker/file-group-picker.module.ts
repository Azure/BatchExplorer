import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormModule, I18nUIModule } from "@batch-flask/ui";
import { FileGroupPickerComponent } from "./file-group-picker.component";
import { SelectModule } from "../../../../../@batch-flask/ui/select/select.module";

const publicComponents = [FileGroupPickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        FormModule,
        ReactiveFormsModule,
        FormsModule,
        I18nUIModule,
        SelectModule
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
})

export class FileGroupPickerModule {
}
