import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { FormModule, I18nUIModule } from "@batch-flask/ui";
import { BlobContainerPickerComponent } from "./blob-container-picker.component";

const publicComponents = [BlobContainerPickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        FormModule,
        MatAutocompleteModule,
        I18nUIModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class BlobContainerPickerModule {
}
