import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";
import { PromptDialogComponent } from "@batch-flask/ui/dialogs/prompt";
import { FormModule } from "@batch-flask/ui/form";
import { I18nUIModule } from "../i18n";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";

@NgModule({
    declarations: [
        ConfirmationDialogComponent,
        PromptDialogComponent,
    ],
    exports: [
        ConfirmationDialogComponent,
        PromptDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        FormModule,
        I18nUIModule,
    ],
    entryComponents: [
        ConfirmationDialogComponent,
        PromptDialogComponent,
    ],
})
export class DialogsModule {
}
