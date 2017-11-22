import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { BaseModule } from "app/components/base";
import { HistoryGraphComponent } from "./history-graph";
import { NodesHeatmapLegendComponent } from "./nodes-heatmap-legend.component";
import { NodesHeatmapComponent } from "./nodes-heatmap.component";
import {
    CpuUsageGraphComponent, DiskUsageGraphComponent, EnableAppInsightsDocComponent,
    MemoryUsageGraphComponent, NetworkUsageGraphComponent, PerformanceGraphComponent,
} from "./performance-graph";
import { PoolGraphsComponent } from "./pool-graphs.component";

const components = [NodesHeatmapComponent,
    NodesHeatmapLegendComponent, PoolGraphsComponent, HistoryGraphComponent,
    PerformanceGraphComponent, CpuUsageGraphComponent,
    MemoryUsageGraphComponent, DiskUsageGraphComponent,
    NetworkUsageGraphComponent, EnableAppInsightsDocComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule, FormsModule, ReactiveFormsModule],
})
export class PoolGraphsModule {

}
