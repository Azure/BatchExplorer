import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { JobScheduleActionModule } from "app/components/jobSchedule/action";
import { JobScheduleListComponent } from "./browse/job-schedule-list.component";
import { JobScheduleHomeComponent } from "./home/job-schedule-home.component";

const components = [
    JobScheduleHomeComponent,
    JobScheduleListComponent,
];

const modules = [
    JobScheduleActionModule, ...commonModules,
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
