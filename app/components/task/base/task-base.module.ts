import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { BaseModule } from "@bl-common/ui";
import { ContainerSettingsPickerComponent, RegistryPickerComponent } from "./container-settings";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";
import { UserIdentityComponent } from "./user-identity";

const components = [
    ContainerSettingsPickerComponent, RegistryPickerComponent,
    ResourcefilePickerComponent, UserIdentityComponent,
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
