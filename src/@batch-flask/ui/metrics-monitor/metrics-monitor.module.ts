import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { VTabsModule } from "@batch-flask/ui/vtabs";
import { MetricsMonitorGraphComponent } from "./metrics-monitor-metric";
import { MetricsMonitorComponent } from "./metrics-monitor.component";

const privateComponents = [];
const publicComponents = [MetricsMonitorComponent, MetricsMonitorGraphComponent];

@NgModule({
    imports: [BrowserModule, VTabsModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class MetricsMonitorModule {

}
