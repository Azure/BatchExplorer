import { NgModule } from "@angular/core";

import { BaseModule } from "@bl-common/ui";
import { commonModules } from "app/common";
import { JobActionModule } from "app/components/job/action";
import { JobScheduleCreateBasicDialogComponent } from "./add/job-schedule-create-basic-dialog.component";
import { JobScheduleJobSpecificationComponent } from "./add/job-schedule-job-specification.component";
import { DeleteJobScheduleDialogComponent } from "./delete/delete-job-schedule-dialog.component";
import { DisableJobScheduleDialogComponent } from "./disable/disable-job-schedule-dialog.component";
import { EnableJobScheduleDialogComponent } from "./enable/enable-job-schedule-dialog.component";
import { TerminateJobScheduleDialogComponent } from "./terminate/terminate-job-schedule-dialog.component";

const components = [
    JobScheduleCreateBasicDialogComponent, DeleteJobScheduleDialogComponent, DisableJobScheduleDialogComponent,
    EnableJobScheduleDialogComponent, TerminateJobScheduleDialogComponent, JobScheduleJobSpecificationComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, JobActionModule, BaseModule],
    entryComponents: [
        JobScheduleCreateBasicDialogComponent, DeleteJobScheduleDialogComponent, DisableJobScheduleDialogComponent,
        EnableJobScheduleDialogComponent, TerminateJobScheduleDialogComponent,
    ],
})
export class JobScheduleActionModule {
}
