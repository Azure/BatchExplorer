import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormModule } from "@batch-flask/ui";
import { PoolBaseModule } from "../../base";
import { EditAppPackageFormComponent } from "./edit-app-package";

const publicComponents = [EditAppPackageFormComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, FormModule, PoolBaseModule, ReactiveFormsModule, FormsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [EditAppPackageFormComponent],
})
export class EditPoolModule {
}
