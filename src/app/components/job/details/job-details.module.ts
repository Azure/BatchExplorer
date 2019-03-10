import { NgModule } from "@angular/core";
import { BaseModule, FileModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { ResourceFilesPropertiesModule } from "app/components/common";
import { FileBrowseModule } from "app/components/file/browse";
import { JobScheduleActionModule } from "app/components/job-schedule/action";
import { TaskBrowseModule } from "app/components/task/browse";
import { TaskModule } from "app/components/task/task.module";
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
    JobHookTaskModule, JobGraphsModule, JobActionModule, TaskModule, JobScheduleActionModule,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        JobBaseModule,
        ResourceFilesPropertiesModule,
        ...commonModules,
        ...modules,
    ],
})
export class JobDetailsModule {
}
