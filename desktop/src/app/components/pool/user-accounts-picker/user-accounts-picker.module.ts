import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormModule, I18nUIModule } from "@batch-flask/ui";
import { UserAccountPickerComponent } from "./user-account-picker/user-account-picker.component";
import { UserAccountsPickerComponent } from "./user-accounts-picker.component";

const publicComponents = [UserAccountPickerComponent, UserAccountsPickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        FormModule,
        FormsModule,
        I18nUIModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        ReactiveFormsModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class UserAccountsPickerModule {
}
