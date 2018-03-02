import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { BaseModule } from "@bl-common/ui";
import { TaskBaseModule } from "app/components/task/base";
import { StartTaskEditFormComponent } from "./start-task-edit-form.component";
import { StartTaskPickerComponent } from "./start-task-picker.component";

const components = [StartTaskEditFormComponent, StartTaskPickerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, FormsModule, ReactiveFormsModule,
        BaseModule, TaskBaseModule],
    entryComponents: [StartTaskEditFormComponent],
})
export class StartTaskModule {

}
