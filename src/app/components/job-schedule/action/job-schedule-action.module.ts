import { NgModule } from "@angular/core";

import { BaseModule } from "@batch-flask/ui";
import { DatetimePickerModule } from "@batch-flask/ui/datetime-picker";
import { commonModules } from "app/common";
import { JobActionModule } from "app/components/job/action";
import { JobScheduleCreateBasicDialogComponent } from "./add/job-schedule-create-basic-dialog.component";
import { JobScheduleJobSpecificationComponent } from "./add/job-schedule-job-specification.component";
import { PatchJobScheduleComponent } from "./add/patch-job-schedule-form.component";
import { DeleteJobScheduleDialogComponent } from "./delete/delete-job-schedule-dialog.component";
import { DisableJobScheduleDialogComponent } from "./disable/disable-job-schedule-dialog.component";
import { EnableJobScheduleDialogComponent } from "./enable/enable-job-schedule-dialog.component";
import { TerminateJobScheduleDialogComponent } from "./terminate/terminate-job-schedule-dialog.component";

const components = [
    JobScheduleCreateBasicDialogComponent,
    DeleteJobScheduleDialogComponent,
    DisableJobScheduleDialogComponent,
    EnableJobScheduleDialogComponent,
    TerminateJobScheduleDialogComponent,
    JobScheduleJobSpecificationComponent,
    PatchJobScheduleComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, JobActionModule, BaseModule, DatetimePickerModule],
    entryComponents: [
        JobScheduleCreateBasicDialogComponent, DeleteJobScheduleDialogComponent, DisableJobScheduleDialogComponent,
        EnableJobScheduleDialogComponent, TerminateJobScheduleDialogComponent, PatchJobScheduleComponent,
    ],
})
export class JobScheduleActionModule {
}
