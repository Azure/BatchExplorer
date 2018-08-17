import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ActivityMonitorComponent } from "./activity-monitor.component";

const components = [
    ActivityMonitorComponent,
];

const modules = [
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules,
        ...modules,
    ],
})
export class ActivityMonitorModule {
}
