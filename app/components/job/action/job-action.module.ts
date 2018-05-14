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
import { DisableJobButtonComponent, DisableJobDialogComponent } from "./disable";
import { EnableJobButtonComponent } from "./enable";

const components = [
    JobCreateBasicDialogComponent, JobManagerTaskPickerComponent, PoolPickerComponent,
    PatchJobComponent, JobPreparationTaskPickerComponent, JobReleaseTaskPickerComponent,
    DisableJobDialogComponent, DisableJobButtonComponent, EnableJobButtonComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, TaskBaseModule, BaseModule],
    entryComponents: [
        JobCreateBasicDialogComponent, DisableJobDialogComponent, PatchJobComponent,
    ],
})
export class JobActionModule {

}
