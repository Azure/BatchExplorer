import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormModule, I18nUIModule } from "@batch-flask/ui";
import { PoolBaseModule } from "../../base";
import { EditAppPackageFormComponent } from "./edit-app-package";
import { EditCertificateReferencesComponent } from "./edit-certificate";

const publicComponents = [EditAppPackageFormComponent, EditCertificateReferencesComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, FormModule, PoolBaseModule, ReactiveFormsModule, FormsModule, I18nUIModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [EditAppPackageFormComponent, EditCertificateReferencesComponent],
})
export class EditPoolModule {
}
