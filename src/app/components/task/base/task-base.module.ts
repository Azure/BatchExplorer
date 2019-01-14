import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { BaseModule } from "@batch-flask/ui";
import { ContainerSettingsPickerComponent, RegistryPickerComponent } from "./container-settings";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";
import { TaskStateComponent } from "./task-state";
import { UserIdentityPickerComponent } from "./user-identity";

const components = [
    ContainerSettingsPickerComponent, RegistryPickerComponent,
    ResourcefilePickerComponent, UserIdentityPickerComponent, TaskStateComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        CommonModule, MaterialModule, RouterModule, BaseModule, FormsModule,
        ReactiveFormsModule,
    ],
})
export class TaskBaseModule {
}
