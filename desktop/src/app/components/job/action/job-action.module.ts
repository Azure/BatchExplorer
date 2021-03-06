import { NgModule } from "@angular/core";
import { BaseModule, SidebarModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { ResourceFilePickerModule } from "app/components/common";
import { TaskBaseModule } from "app/components/task/base";
import {
    AddJobFormComponent,
    JobManagerTaskPickerComponent,
    JobPreparationTaskPickerComponent,
    JobReleaseTaskPickerComponent,
    PatchJobComponent,
    PoolPickerComponent,
} from "./add";
import { DisableJobButtonComponent, DisableJobDialogComponent } from "./disable";
import { EnableJobButtonComponent } from "./enable";

const components = [
    AddJobFormComponent, JobManagerTaskPickerComponent, PoolPickerComponent,
    PatchJobComponent, JobPreparationTaskPickerComponent, JobReleaseTaskPickerComponent,
    DisableJobDialogComponent, DisableJobButtonComponent, EnableJobButtonComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, TaskBaseModule, BaseModule, SidebarModule, ResourceFilePickerModule],
    entryComponents: [
        AddJobFormComponent, DisableJobDialogComponent, PatchJobComponent,
    ],
})
export class JobActionModule {

}
