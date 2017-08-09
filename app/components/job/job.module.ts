import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { JobActionModule } from "app/components/job/action";
import { JobStatsPreviewComponent } from "app/components/job/base/job-stats-preview";
import { JobAdvancedFilterComponent } from "app/components/job/browse/filter/job-advanced-filter.component";
import { JobListComponent } from "app/components/job/browse/job-list.component";
import { JobDetailsModule } from "app/components/job/details";
import { JobHomeComponent } from "app/components/job/home/job-home.component";
import { JobGraphsModule } from "./graphs";
import { JobHookTaskModule } from "./job-hook-task";

const components = [
    JobAdvancedFilterComponent, JobHomeComponent, JobListComponent, JobStatsPreviewComponent,
];

const modules = [
    JobActionModule, JobDetailsModule, JobHookTaskModule, JobGraphsModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
    ],
})
export class JobModule {
}
