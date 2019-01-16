import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { EditorModule } from "@batch-flask/ui/editor";
import { SelectModule } from "@batch-flask/ui/select";
import { ServerErrorModule } from "@batch-flask/ui/server-error";
import { ButtonsModule } from "../buttons";
import { I18nUIModule } from "../i18n";
import { ComplexFormComponent } from "./complex-form";
import { FormFooterComponent } from "./complex-form/footer";
import { EditableTableModule } from "./editable-table";
import { ExpandingTextareaComponent } from "./expanding-textarea";
import { FormErrorComponent } from "./form-error";
import { FormFieldComponent, FormFieldPrefixDirective, FormFieldSuffixDirective } from "./form-field";
import { FormJsonEditorComponent } from "./form-json-editor";
import { FormPageComponent } from "./form-page";
import { FormMultiPickerComponent, FormPickerComponent, FormPickerItemTemplateDirective } from "./form-picker";
import { FormSectionComponent } from "./form-section";
import { HintComponent } from "./hint";
import { InputDirective } from "./input";
import { KeyValuePickerComponent } from "./key-value-picker";
import { SimpleFormComponent } from "./simple-form";
import { SingleLineTextareaDirective } from "./single-line-textarea";

// components
// Add submodules there
const modules = [
    EditableTableModule,
];

// Add subcomponnent not in a module here
const components = [
    SimpleFormComponent,
    ComplexFormComponent,
    FormErrorComponent,
    FormPageComponent,
    FormSectionComponent,
    FormMultiPickerComponent,
    FormPickerComponent,
    FormPickerItemTemplateDirective,
    KeyValuePickerComponent,
    ExpandingTextareaComponent,
    SingleLineTextareaDirective,
    FormJsonEditorComponent,
    FormFooterComponent,
    InputDirective,
    FormFieldComponent,
    HintComponent,
    FormFieldPrefixDirective,
    FormFieldSuffixDirective,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [
        I18nUIModule,
        CommonModule,
        ButtonsModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        SelectModule,
        RouterModule,
        EditorModule,
        ServerErrorModule,
        ...modules,
    ],
})
export class FormModule {
}
