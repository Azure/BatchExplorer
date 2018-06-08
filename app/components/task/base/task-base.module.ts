import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { BaseModule } from "@batch-flask/ui";
import { ContainerSettingsPickerComponent, RegistryPickerComponent } from "./container-settings";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";
import { TaskStateComponent } from "./task-state";
import { UserIdentityComponent } from "./user-identity";

const components = [
    ContainerSettingsPickerComponent, RegistryPickerComponent,
    ResourcefilePickerComponent, UserIdentityComponent, TaskStateComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        BrowserModule, MaterialModule, RouterModule, BaseModule, FormsModule,
        ReactiveFormsModule,
    ],
})
export class TaskBaseModule {
}
