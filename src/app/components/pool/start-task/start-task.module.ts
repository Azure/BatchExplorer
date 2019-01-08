import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { ResourceFilePickerModule } from "app/components/common";
import { TaskBaseModule } from "app/components/task/base";
import { StartTaskEditFormComponent } from "./start-task-edit-form.component";
import { StartTaskPickerComponent } from "./start-task-picker.component";

const components = [StartTaskEditFormComponent, StartTaskPickerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        CommonModule,
        MaterialModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        BaseModule,
        TaskBaseModule,
        ResourceFilePickerModule,
    ],
    entryComponents: [StartTaskEditFormComponent],
})
export class StartTaskModule {

}
