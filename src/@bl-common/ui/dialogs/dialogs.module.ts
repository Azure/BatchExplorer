import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@bl-common/core";

import { PromptDialogComponent } from "@bl-common/ui/dialogs/prompt";
import { FormModule } from "@bl-common/ui/form";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";
import { DialogService } from "./dialog.service";

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
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        FormModule,
    ],
    providers: [
        DialogService,
    ],
    entryComponents: [
        ConfirmationDialogComponent,
        PromptDialogComponent,
    ],
})
export class DialogsModule {
}
