import { NgModule } from "@angular/core";

import { BaseModule, FileModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { TaskBrowseModule } from "app/components/task/browse";
import { JobActionModule } from "../action";
import { JobBaseModule } from "../base";
import { JobGraphsModule } from "../graphs";
import { JobHookTaskModule } from "../job-hook-task";
import { JobErrorDisplayComponent } from "./error-display";
import { JobConfigurationComponent } from "./job-configuration.component";
import { JobDefaultComponent } from "./job-default.component";
import { JobDetailsComponent } from "./job-details.component";
import { JobProgressStatusComponent } from "./job-progress-status";

const components = [
    JobConfigurationComponent,
    JobDefaultComponent,
    JobDetailsComponent,
    JobErrorDisplayComponent,
    JobProgressStatusComponent,
];

const modules = [
    BaseModule, FileBrowseModule, FileModule, TaskBrowseModule,
    JobHookTaskModule, JobGraphsModule, JobActionModule,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        JobBaseModule,
        ...commonModules,
        ...modules,
    ],
})
export class JobDetailsModule {
}
