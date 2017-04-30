import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { ButtonsModule } from "../buttons";
import { ComplexFormComponent } from "./complex-form";
import { FormErrorComponent } from "./form-error";
import { FormPageComponent } from "./form-page";
import { FormMultiPickerComponent, FormPickerComponent, NestedFormDirective } from "./form-picker";
import { FormSectionComponent } from "./form-section";
import { ServerErrorComponent } from "./server-error";
import { SimpleFormComponent } from "./simple-form";

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
    NestedFormDirective,
    FormPickerComponent,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [
        BrowserModule,
        ButtonsModule,
        FormsModule,
        MaterialModule.forRoot(),
        ReactiveFormsModule,
        RouterModule,
        ...modules,
    ],
    providers: [
    ],
})
export class FormModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: FormModule,
            providers: [],
        };
    }
}
