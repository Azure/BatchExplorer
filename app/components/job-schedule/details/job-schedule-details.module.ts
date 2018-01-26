import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { BaseModule } from "app/components/base";
import { JobDetailsModule } from "app/components/job/details";
import { PoolDetailsModule } from "app/components/pool/details";
import { JobScheduleAutoPoolComponent } from "./job-schedule-autopool.component";
import { JobScheduleConfigurationComponent } from "./job-schedule-configuration.component";
import { JobScheduleDefaultComponent } from "./job-schedule-default.component";
import { JobScheduleDetailsComponent } from "./job-schedule-details.component";
import { JobScheduleJobSpecificationComponent } from "./job-schedule-job-specification.component";

const components = [
    JobScheduleAutoPoolComponent,
    JobScheduleConfigurationComponent,
    JobScheduleDetailsComponent,
    JobScheduleDefaultComponent,
    JobScheduleJobSpecificationComponent,
];

const modules = [
    BaseModule,
    JobDetailsModule,
    PoolDetailsModule,
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
