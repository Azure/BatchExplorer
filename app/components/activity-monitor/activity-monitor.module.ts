import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { ActivityMonitorItemComponent } from "./activity-monitor-item";
import { ActivityMonitorComponent } from "./activity-monitor.component";

const components = [
    ActivityMonitorComponent,
    ActivityMonitorItemComponent,
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
