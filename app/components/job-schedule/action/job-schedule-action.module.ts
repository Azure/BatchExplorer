import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { BaseModule } from "app/components/base";
import { JobScheduleCreateBasicDialogComponent } from "./add/job-schedule-create-basic-dialog.component";
import { DeleteJobScheduleDialogComponent } from "./delete/delete-job-schedule-dialog.component";
import { DisableJobScheduleDialogComponent } from "./disable/disable-job-schedule-dialog.component";
import { EnableJobScheduleDialogComponent } from "./enable/enable-job-schedule-dialog.component";
import { TerminateJobScheduleDialogComponent } from "./terminate/terminate-job-schedule-dialog.component";

const components = [
    JobScheduleCreateBasicDialogComponent, DeleteJobScheduleDialogComponent, DisableJobScheduleDialogComponent,
    EnableJobScheduleDialogComponent, TerminateJobScheduleDialogComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, BaseModule],
    entryComponents: [
        JobScheduleCreateBasicDialogComponent, DeleteJobScheduleDialogComponent, DisableJobScheduleDialogComponent,
        EnableJobScheduleDialogComponent, TerminateJobScheduleDialogComponent,
    ],
})
export class JobScheduleActionModule {

}
