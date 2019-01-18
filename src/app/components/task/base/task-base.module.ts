import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { BaseModule } from "@batch-flask/ui";
import { ResourceFilePickerModule } from "app/components/common";
import { ContainerSettingsPickerComponent, RegistryPickerComponent } from "./container-settings";
import { TaskStateComponent } from "./task-state";
import { UserIdentityPickerComponent } from "./user-identity";

const components = [
    ContainerSettingsPickerComponent, RegistryPickerComponent,
    TaskStateComponent,
    UserIdentityPickerComponent, TaskStateComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        CommonModule, MaterialModule, RouterModule, BaseModule, FormsModule,
        ReactiveFormsModule, ResourceFilePickerModule,
    ],
})
export class TaskBaseModule {
}
