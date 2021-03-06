import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { NodeConnectModule } from "app/components/node/connect";
import { NodesHeatmapComponent, NodesHeatmapLegendComponent } from "./heatmap";
import { HistoryGraphComponent } from "./history-graph";
import {
    CpuUsageGraphComponent, DiskIOGraphComponent, DiskUsageGraphComponent,
    EnableAppInsightsDocComponent, GpuMemoryUsageGraphComponent,
    GpuUsageGraphComponent, MemoryUsageGraphComponent, NetworkUsageGraphComponent,
    PerformanceGraphComponent,
} from "./performance-graph";
import { PoolGraphsComponent } from "./pool-graphs.component";
import { PoolStateGraphComponent } from "./pool-state-graph";
import { PoolStandaloneGraphsComponent } from "./standalone";

const components = [
    CpuUsageGraphComponent,
    DiskIOGraphComponent,
    DiskUsageGraphComponent,
    EnableAppInsightsDocComponent,
    GpuMemoryUsageGraphComponent,
    GpuUsageGraphComponent,
    HistoryGraphComponent,
    MemoryUsageGraphComponent,
    NetworkUsageGraphComponent,
    NodesHeatmapComponent,
    NodesHeatmapLegendComponent,
    PerformanceGraphComponent,
    PoolGraphsComponent,
    PoolStandaloneGraphsComponent,
    PoolStateGraphComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        CommonModule,
        NodeConnectModule,
        MaterialModule,
        RouterModule,
        BaseModule,
        FormsModule,
        ReactiveFormsModule,
    ],
})
export class PoolGraphsModule {

}
