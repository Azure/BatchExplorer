import { NgModule } from "@angular/core";
import { commonModules } from "app/common";

import { BaseModule } from "@batch-flask/ui";
import { TaskBaseModule } from "app/components/task/base";
import {
    JobCreateBasicDialogComponent,
    JobManagerTaskPickerComponent,
    JobPreparationTaskPickerComponent,
    JobReleaseTaskPickerComponent,
    PatchJobComponent,
    PoolPickerComponent,
} from "./add";
import { AddTaskButtonComponent } from "./add-task";
import { DeleteJobDialogComponent } from "./delete/delete-job-dialog.component";
import { DisableJobButtonComponent, DisableJobDialogComponent } from "./disable";
import { EnableJobButtonComponent, EnableJobDialogComponent } from "./enable";
import { JobCommands } from "./job-commands";
import { TerminateButtonComponent, TerminateJobDialogComponent } from "./terminate";

const components = [
    JobCreateBasicDialogComponent, JobManagerTaskPickerComponent, PoolPickerComponent,
    PatchJobComponent, JobPreparationTaskPickerComponent, JobReleaseTaskPickerComponent,
    DeleteJobDialogComponent, DisableJobDialogComponent, EnableJobDialogComponent,
    TerminateJobDialogComponent, AddTaskButtonComponent, DisableJobButtonComponent,
    EnableJobButtonComponent, TerminateButtonComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, TaskBaseModule, BaseModule],
    entryComponents: [
        JobCreateBasicDialogComponent, DeleteJobDialogComponent, DisableJobDialogComponent,
        EnableJobDialogComponent, TerminateJobDialogComponent, PatchJobComponent,
    ],
    providers: [
        JobCommands,
    ],
})
export class JobActionModule {

}
