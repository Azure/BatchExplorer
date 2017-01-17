import { NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { StartTaskFormComponent } from "./start-task-form.component";
import { StartTaskPickerComponent } from "./start-task-picker.component";
import { StartTaskPropertiesComponent } from "./start-task-properties.component";

const components = [StartTaskFormComponent, StartTaskPickerComponent, StartTaskPropertiesComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule],
})
export class StartTaskModule {

}
