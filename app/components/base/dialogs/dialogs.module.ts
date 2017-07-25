import {  NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

import { FormModule } from "app/components/base/form";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";
import { DialogService } from "./dialog.service";

@NgModule({
    declarations: [
        ConfirmationDialogComponent,
    ],
    exports: [
        ConfirmationDialogComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        FormModule,
    ],
    providers: [
        DialogService,
    ],
    entryComponents: [
        ConfirmationDialogComponent,
    ],
})
export class DialogsModule {
}
