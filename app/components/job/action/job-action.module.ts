import { NgModule } from "@angular/core";
import { commonModules } from "app/common";

import { BaseModule } from "app/components/base";
import { JobCreateBasicDialogComponent } from "./add/job-create-basic-dialog.component";
import { DeleteJobDialogComponent } from "./delete/delete-job-dialog.component";
import { DisableJobDialogComponent } from "./disable/disable-job-dialog.component";
import { EnableJobDialogComponent } from "./enable/enable-job-dialog.component";
import { TerminateJobDialogComponent } from "./terminate/terminate-job-dialog.component";

const components = [
    JobCreateBasicDialogComponent, DeleteJobDialogComponent, DisableJobDialogComponent,
    EnableJobDialogComponent, TerminateJobDialogComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, BaseModule],
    entryComponents: [
        JobCreateBasicDialogComponent, DeleteJobDialogComponent, DisableJobDialogComponent,
        EnableJobDialogComponent, TerminateJobDialogComponent,
    ],
})
export class JobActionModule {

}
