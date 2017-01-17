import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { TaskBaseModule } from "app/components/task/base";
import { StartTaskEditFormComponent } from "./start-task-edit-form.component";
import { StartTaskPickerComponent } from "./start-task-picker.component";
import { StartTaskPropertiesComponent } from "./start-task-properties.component";

const components = [StartTaskEditFormComponent, StartTaskPickerComponent, StartTaskPropertiesComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, FormsModule, ReactiveFormsModule,
        BaseModule, TaskBaseModule],
})
export class StartTaskModule {

}
