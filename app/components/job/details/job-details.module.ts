import { NgModule } from "@angular/core";

import { BaseModule } from "@batch-flask/ui";
import { FileDetailsModule } from "@batch-flask/ui/file/details";
import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";
import { TaskBrowseModule } from "app/components/task/browse";
import { JobActionModule } from "../action";
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
    BaseModule, FileBrowseModule, FileDetailsModule, TaskBrowseModule,
    JobHookTaskModule, JobGraphsModule, JobActionModule,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules,
        ...modules,
    ],
})
export class JobDetailsModule {
}
