import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { MonitorChartComponent } from "./monitor-chart";

const privateComponents = [];
const publicComponents = [
    MonitorChartComponent,
];

@NgModule({
    imports: [...commonModules],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class AccountMonitoringModule {

}
