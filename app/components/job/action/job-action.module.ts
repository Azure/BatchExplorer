import { NgModule } from "@angular/core";
import { commonModules } from "app/common";

import { BaseModule } from "app/components/base";
import { TaskBaseModule } from "app/components/task/base";
import {
    JobCreateBasicDialogComponent,
    JobManagerTaskPickerComponent,
    JobPreparationTaskPickerComponent,
    JobReleaseTaskPickerComponent,
    PoolPickerComponent,
} from "./add";
import { DeleteJobDialogComponent } from "./delete/delete-job-dialog.component";
import { DisableJobDialogComponent } from "./disable/disable-job-dialog.component";
import { EnableJobDialogComponent } from "./enable/enable-job-dialog.component";
import { TerminateJobDialogComponent } from "./terminate/terminate-job-dialog.component";

const components = [
    JobCreateBasicDialogComponent, JobManagerTaskPickerComponent, PoolPickerComponent,
    JobPreparationTaskPickerComponent, JobReleaseTaskPickerComponent, DeleteJobDialogComponent,
    DisableJobDialogComponent, EnableJobDialogComponent, TerminateJobDialogComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, TaskBaseModule, BaseModule],
    entryComponents: [
        JobCreateBasicDialogComponent, DeleteJobDialogComponent, DisableJobDialogComponent,
        EnableJobDialogComponent, TerminateJobDialogComponent,
    ],
})
export class JobActionModule {

}
