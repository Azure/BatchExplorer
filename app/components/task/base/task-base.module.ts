import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { FileGroupPickerComponent } from "./file-group-picker.component";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";
import { UserIdentityComponent } from "./user-identity";

const components = [FileGroupPickerComponent, ResourcefilePickerComponent, UserIdentityComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule, FormsModule, ReactiveFormsModule],
})
export class TaskBaseModule {
}
