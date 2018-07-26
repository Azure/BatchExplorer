import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { BaseModule } from "@batch-flask/ui";
import { NodesHeatmapComponent, NodesHeatmapLegendComponent } from "./heatmap";
import { HistoryGraphComponent } from "./history-graph";
import {
    CpuUsageGraphComponent, DiskIOGraphComponent, DiskUsageGraphComponent,
    EnableAppInsightsDocComponent, MemoryUsageGraphComponent, NetworkUsageGraphComponent,
    PerformanceGraphComponent,
} from "./performance-graph";
import { PoolGraphsComponent } from "./pool-graphs.component";
import { PoolStateGraphComponent } from "./pool-state-graph";
import { PoolStandaloneGraphsComponent } from "./standalone";

const components = [NodesHeatmapComponent,
    NodesHeatmapLegendComponent, PoolGraphsComponent, HistoryGraphComponent,
    PerformanceGraphComponent, CpuUsageGraphComponent,
    MemoryUsageGraphComponent, DiskUsageGraphComponent, DiskIOGraphComponent,
    NetworkUsageGraphComponent, EnableAppInsightsDocComponent,
    PoolStandaloneGraphsComponent,
    PoolStateGraphComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule, FormsModule, ReactiveFormsModule],
})
export class PoolGraphsModule {

}
