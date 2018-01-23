import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { BaseModule } from "app/components/base";
import { JobScheduleConfigurationComponent } from "./job-schedule-configuration.component";
import { JobScheduleDefaultComponent } from "./job-schedule-default.component";
import { JobScheduleDetailsComponent } from "./job-schedule-details.component";

const components = [
    JobScheduleConfigurationComponent,
    JobScheduleDetailsComponent,
    JobScheduleDefaultComponent,
];

const modules = [
    BaseModule,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules,
        ...modules,
    ],
})
export class JobScheduleDetailsModule {
}
