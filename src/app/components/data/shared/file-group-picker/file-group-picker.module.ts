import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { FormModule, I18nUIModule } from "@batch-flask/ui";
import { FileGroupPickerComponent } from "./file-group-picker.component";

const publicComponents = [FileGroupPickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        MatAutocompleteModule,
        FormModule,
        ReactiveFormsModule,
        FormsModule,
        I18nUIModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class FileGroupPickerModule {
}
