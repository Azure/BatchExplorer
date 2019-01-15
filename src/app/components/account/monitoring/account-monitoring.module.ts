import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TimeRangePickerModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { AccountMonitoringHomeComponent } from "./account-monitoring-home";
import { MonitorChartComponent } from "./monitor-chart";

const privateComponents = [];
const publicComponents = [
    MonitorChartComponent,
    AccountMonitoringHomeComponent,
];

@NgModule({
    imports: [CommonModule, ...commonModules, TimeRangePickerModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
    entryComponents: [
        AccountMonitoringHomeComponent,
    ],
})
export class AccountMonitoringModule {

}
