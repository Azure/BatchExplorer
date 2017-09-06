import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { ButtonsModule } from "../buttons";
import { ComplexFormComponent } from "./complex-form";
import { EditMetadataFormComponent } from "./edit-metadata-form";
import { EditableTableColumnComponent, EditableTableComponent } from "./editable-table";
import { ExpandingTextareaComponent } from "./expanding-textarea";
import { FormErrorComponent } from "./form-error";
import { FormPageComponent } from "./form-page";
import { FormMultiPickerComponent, FormPickerComponent, FormPickerItemTemplateDirective } from "./form-picker";
import { FormSectionComponent } from "./form-section";
import { KeyValuePickerComponent } from "./key-value-picker";
import { ServerErrorComponent } from "./server-error";
import { SimpleFormComponent } from "./simple-form";
import { SingleLineTextareaDirective } from "./single-line-textarea";

// components
// Add submodules there
const modules = [
];

// Add subcomponnent not in a module here
const components = [
    SimpleFormComponent,
    ComplexFormComponent,
    FormErrorComponent,
    ServerErrorComponent,
    FormPageComponent,
    FormSectionComponent,
    FormMultiPickerComponent,
    FormPickerComponent,
    FormPickerItemTemplateDirective,
    EditableTableComponent,
    EditableTableColumnComponent,
    KeyValuePickerComponent,
    EditMetadataFormComponent,
    ExpandingTextareaComponent,
    SingleLineTextareaDirective,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [
        BrowserModule,
        ButtonsModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        RouterModule,
        ...modules,
    ],
    providers: [
    ],
    entryComponents: [EditMetadataFormComponent],
})
export class FormModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: FormModule,
            providers: [],
        };
    }
}
