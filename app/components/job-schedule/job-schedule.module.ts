import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { JobScheduleActionModule } from "./action/job-schedule-action.module";
import { JobScheduleListComponent } from "./browse/job-schedule-list.component";
import { JobScheduleDetailsModule } from "./details/job-schedule-details.module";
import { JobScheduleHomeComponent } from "./home/job-schedule-home.component";

const components = [
    JobScheduleHomeComponent,
    JobScheduleListComponent,
];

const modules = [
    JobScheduleDetailsModule, JobScheduleActionModule, ...commonModules,
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
