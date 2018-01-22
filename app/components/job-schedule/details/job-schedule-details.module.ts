import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { BaseModule } from "app/components/base";
import { JobScheduleDetailsComponent } from "./job-schedule-details.component";
const components = [
    JobScheduleDetailsComponent,
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
