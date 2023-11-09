import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormModule, I18nUIModule } from "@batch-flask/ui";
import { PoolBaseModule } from "../../base";
import { EditAppPackageFormComponent } from "./edit-app-package";
import { EditCertificateReferencesComponent } from "./edit-certificate";
import { EditNodeCommsFormComponent } from "./edit-node-comms";

const publicComponents = [EditAppPackageFormComponent, EditCertificateReferencesComponent, EditNodeCommsFormComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, FormModule, PoolBaseModule, ReactiveFormsModule, FormsModule, I18nUIModule, ...commonModules],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [EditAppPackageFormComponent, EditCertificateReferencesComponent, EditNodeCommsFormComponent],
})
export class EditPoolModule {
}
