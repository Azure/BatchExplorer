import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { JobScheduleActionModule } from "./action";
import { JobScheduleAdvancedFilterComponent } from "./browse/filter/job-schedule-advanced-filter.component";
import { JobScheduleListComponent } from "./browse/job-schedule-list.component";
import { JobScheduleDetailsModule } from "./details/job-schedule-details.module";
import { JobScheduleHomeComponent } from "./home/job-schedule-home.component";

const components = [
    JobScheduleAdvancedFilterComponent,
    JobScheduleHomeComponent,
    JobScheduleListComponent,
];

const modules = [
    JobScheduleActionModule, JobScheduleDetailsModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
    ],
})
export class JobScheduleModule {
}
